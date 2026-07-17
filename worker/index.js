import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteer.use(StealthPlugin());
import dotenv from 'dotenv';
import ws from 'ws';
import { runAudit, analyzeWithCohere, analyzeWithGroq } from './shared_audit.js';
import { complete } from './ai_hub.js';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[Worker] Fatal Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws }
});

let activeJobs = 0;
const MAX_CONCURRENT = 2;
const jobQueue = [];
const MAX_QUEUE_SIZE = 100;
const MAX_ATTEMPTS = 3;
const JOB_TIMEOUT_MS = 120_000;
const RAM_LIMIT_MB = 2000;
const runningJobs = new Set();

// Retry delays: 1 min, 5 min, 15 min
const RETRY_DELAYS_MS = [60_000, 300_000, 900_000];

// Priority: REPLY > SCRAPE > DISCOVER
const JOB_PRIORITY = { PROCESS_REPLY: 0, SCRAPE: 1, AUDIT: 1, DISCOVER: 2 };
function sortByPriority(queue) {
  return queue.sort((a, b) => (JOB_PRIORITY[a.type] ?? 9) - (JOB_PRIORITY[b.type] ?? 9));
}

console.log('[Knight Worker] Starting...');

// Subscribe to all new jobs across all orgs
supabase
  .channel('jobs-channel')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, (payload) => {
    if (payload.new.status === 'PENDING') {
      if (payload.new.execute_after && new Date(payload.new.execute_after) > new Date()) return;
      if (jobQueue.length >= MAX_QUEUE_SIZE) {
        console.warn(`[Worker] Queue full (${MAX_QUEUE_SIZE}). Dropping job ${payload.new.id}.`);
      } else {
        console.log(`[Job] New job ${payload.new.id} (${payload.new.type}) for org ${payload.new.org_id}`);
        jobQueue.push(payload.new);
        processQueue();
      }
    }
  })
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'jobs' }, (payload) => {
    // Pick up manually-retried jobs (admin sets status back to PENDING)
    if (payload.new.status === 'PENDING' && payload.old.status !== 'PENDING') {
      if (payload.new.execute_after && new Date(payload.new.execute_after) > new Date()) return;
      if (jobQueue.find(j => j.id === payload.new.id)) return; // already queued
      if (jobQueue.length >= MAX_QUEUE_SIZE) {
        console.warn(`[Worker] Queue full. Dropping retried job ${payload.new.id}.`);
      } else {
        console.log(`[Job] Retried job ${payload.new.id} (${payload.new.type}) picked up`);
        jobQueue.push(payload.new);
        processQueue();
      }
    }
  })
  .subscribe(async () => {
    console.log('[Knight Worker] Connected to Supabase realtime');
    await fetchPendingJobs();
    setInterval(fetchPendingJobs, 60_000);
  });

// Run cleanup once daily at midnight, not on boot
function scheduleMidnightCleanup() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = midnight.getTime() - now.getTime();
  setTimeout(() => {
    runDailyCleanup();
    setInterval(runDailyCleanup, 1000 * 60 * 60 * 24);
  }, msUntilMidnight);
  console.log(`[Cleanup] Scheduled for ${midnight.toISOString()}`);
}
scheduleMidnightCleanup();

async function runDailyCleanup() {
  console.log('[Cleanup] Running daily cleanup for 30-day stale leads...');
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error: fetchError } = await supabase
    .from('companies')
    .select('id, org_id')
    .eq('status', 'PITCHED')
    .lt('created_at', thirtyDaysAgo);

  if (fetchError) {
    console.error('[Cleanup] Failed to fetch stale leads:', fetchError.message);
    return;
  }

  if (data && data.length > 0) {
    for (const company of data) {
      const { error: updateError } = await supabase.from('companies').update({ status: 'REJECTED' }).eq('id', company.id);
      if (updateError) {
        console.error(`[Cleanup] Failed to update company ${company.id}:`, updateError.message);
        continue;
      }

      const { data: audit } = await supabase.from('audits').select('id').eq('company_id', company.id).single();
      if (audit) {
        const { error: insertError } = await supabase.from('audit_results').insert({
          audit_id: audit.id,
          org_id: company.org_id,
          category: 'REJECTED',
          raw_data: {},
          issues_found: { rejection_reason: 'No reply after 30 days' }
        });
        if (insertError) {
          console.error(`[Cleanup] Failed to insert audit result for company ${company.id}:`, insertError.message);
        }
      }
    }
    console.log(`[Cleanup] Cleaned up ${data.length} stale leads.`);
  }
}

async function fetchPendingJobs() {
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'PENDING')
    .lte('execute_after', new Date().toISOString())
    .order('execute_after', { ascending: true });

  if (data && data.length > 0) {
    console.log(`[Worker] Found ${data.length} pending jobs`);
    for (const job of data) {
      if (jobQueue.length >= MAX_QUEUE_SIZE) {
        console.warn(`[Worker] Queue full (${MAX_QUEUE_SIZE}). Skipping remaining pending jobs.`);
        break;
      }
      if (!jobQueue.find(j => j.id === job.id)) jobQueue.push(job);
    }
    processQueue();
  }
}

function getUsedRAM_MB() {
  const mem = process.memoryUsage();
  return Math.round((mem.rss + mem.heapUsed) / 1024 / 1024);
}

function dedupKey(job) {
  if (job.type === 'DISCOVER') return `discover:${job.payload?.keyword}:${job.payload?.location}`;
  return `${job.type}:${job.payload?.target || job.payload?.company_id || job.id}`;
}

function processQueue() {
  while (activeJobs < MAX_CONCURRENT && jobQueue.length > 0) {
    // RAM guard
    const usedMB = getUsedRAM_MB();
    if (usedMB > RAM_LIMIT_MB) {
      console.warn(`[Worker] RAM limit reached (${usedMB}MB > ${RAM_LIMIT_MB}MB). Pausing queue.`);
      setTimeout(() => processQueue(), 30_000);
      return;
    }

    sortByPriority(jobQueue);
    const job = jobQueue.shift();
    const dk = dedupKey(job);

    // Dedup check
    if (runningJobs.has(dk)) {
      console.log(`[Worker] Skipping duplicate: ${dk}`);
      continue;
    }

    activeJobs++;
    runningJobs.add(dk);
    console.log(`[Worker] Active: ${activeJobs}/${MAX_CONCURRENT} | Queue: ${jobQueue.length} | RAM: ${usedMB}MB`);

    handleJob(job)
      .catch(e => console.error('[Worker] Queue error:', e.message))
      .finally(() => {
        activeJobs--;
        runningJobs.delete(dk);
        processQueue();
      });
  }
}

async function handleJob(job) {
  if (job.status !== 'PENDING') return;
  const attempts = (job.attempts || 0) + 1;
  console.log(`[Job] ${job.type} ${job.id} | org: ${job.org_id} | attempt ${attempts}/${MAX_ATTEMPTS}`);

  const { error: startError } = await supabase.from('jobs').update({
    status: 'RUNNING',
    started_at: new Date().toISOString(),
    attempts,
  }).eq('id', job.id);

  if (startError) {
    console.error(`[Job] Failed to mark job ${job.id} as RUNNING:`, startError.message);
    return;
  }

  try {
    // Wrap job with timeout
    const jobPromise = (async () => {
      if (job.type === 'DISCOVER') {
        await handleDiscover(job);
      } else if (job.type === 'PROCESS_REPLY') {
        await handleProcessReply(job);
      } else if (job.type === 'SEND_FOLLOWUP') {
        await handleFollowup(job);
      } else {
        await handleScrape(job);
      }
    })();

    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(`Job timed out after ${JOB_TIMEOUT_MS / 1000}s`)), JOB_TIMEOUT_MS);
    });

    await Promise.race([jobPromise, timeoutPromise]);
    clearTimeout(timeoutId);

    const { error: completeError } = await supabase.from('jobs').update({
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
    }).eq('id', job.id);

    if (completeError) {
      console.error(`[Job] Failed to mark job ${job.id} as COMPLETED:`, completeError.message);
    }
  } catch (error) {
    console.error(`[Job] ${job.id} failed (attempt ${attempts}):`, error.message);

    if (attempts >= MAX_ATTEMPTS) {
      const { error: failError } = await supabase.from('jobs').update({
        status: 'FAILED_PERMANENTLY',
        error: error.message,
        completed_at: new Date().toISOString(),
      }).eq('id', job.id);

      if (failError) {
        console.error(`[Job] Failed to mark job ${job.id} as FAILED_PERMANENTLY:`, failError.message);
      }
      console.error(`[Job] ${job.id} permanently failed after ${MAX_ATTEMPTS} attempts.`);
    } else {
      const retryDelay = RETRY_DELAYS_MS[attempts - 1] || RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
      console.log(`[Job] ${job.id} will retry in ${retryDelay / 1000}s...`);
      const { error: retryError } = await supabase.from('jobs').update({
        status: 'PENDING',
        error: error.message,
        attempts,
      }).eq('id', job.id);

      if (retryError) {
        console.error(`[Job] Failed to mark job ${job.id} for retry:`, retryError.message);
      }

      setTimeout(() => {
        jobQueue.push({ ...job, attempts });
        processQueue();
      }, retryDelay);
    }
  }
}

// ─── TEMPLATE HELPERS ─────────────────────────────────────────────────────────

function renderTemplate(template, variables) {
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    rendered = rendered.split(placeholder).join(value || '');
  }
  return rendered;
}

async function getDefaultTemplate(orgId, type) {
  const { data } = await supabase
    .from('email_templates')
    .select('subject, body')
    .eq('org_id', orgId)
    .eq('type', type)
    .eq('is_default', true)
    .maybeSingle();
  return data;
}

// ─── DISCOVER ─────────────────────────────────────────────────────────────────

async function handleDiscover(job) {
  const { keyword, location } = job.payload;
  const query = `${keyword} ${location || ''}`.trim();
  console.log(`[Discover] Searching: "${query}"`);

  let browser;
  try {
    const wsUrl = process.env.BROWSER_WS_ENDPOINT || 'ws://browserless:3000';
    console.log(`[Discover] Connecting to Browserless at ${wsUrl}`);
    browser = await puppeteer.connect({ browserWSEndpoint: wsUrl });
  } catch (err) {
    console.log(`[Discover] Browserless failed, falling back to local launch:`, err.message);
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  }
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');

  try {
    const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    await page.goto(mapsUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('[role="feed"]', { timeout: 10000 }).catch(() => {});

    await page.evaluate(async () => {
      const feed = document.querySelector('[role="feed"]');
      if (feed) {
        for (let i = 0; i < 5; i++) {
          feed.scrollTop += 800;
          await new Promise(r => setTimeout(r, 800));
        }
      }
    });

    const businessLinks = await page.$$eval('a[href*="/maps/place/"]', links =>
      [...new Set(links.map(a => a.href).filter(h => h.includes('/maps/place/')))].slice(0, 25)
    );

    console.log(`[Discover] Found ${businessLinks.length} businesses`);
    await page.close();

    let queued = 0;
    for (const link of businessLinks) {
      try {
        const bizPage = await browser.newPage();
        await bizPage.goto(link, { waitUntil: 'networkidle2', timeout: 20000 });

        const website = await bizPage.evaluate(() => {
          const links = [...document.querySelectorAll('a[href]')];
          const websiteLink = links.find(a =>
            a.getAttribute('data-item-id')?.includes('authority') ||
            a.getAttribute('aria-label')?.toLowerCase().includes('website')
          );
          return websiteLink?.href || null;
        });

        if (website && !website.includes('google.com') && !website.includes('facebook.com')) {
          const cleanUrl = new URL(website).hostname.replace('www.', '');
          const { error: insertError } = await supabase.from('jobs').insert({
            org_id: job.org_id,
            type: 'SCRAPE',
            status: 'PENDING',
            payload: { target: cleanUrl, source: `discovery:${query}` }
          });

          if (insertError) {
            console.error(`[Discover] Failed to insert SCRAPE job for ${cleanUrl}:`, insertError.message);
          } else {
            queued++;
          }
        }
      } catch { try { await bizPage.close(); } catch {} }
    }

    console.log(`[Discover] Queued ${queued} sites for audit`);
  } finally {
    await browser.close();
  }
}

async function getClearbitData(companyName) {
  try {
    const res = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(companyName)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) return data[0];
    }
  } catch (e) {}
  return null;
}

async function fetchSearxNG(query) {
  try {
    const q = encodeURIComponent(query);
    const searxngUrl = process.env.SEARXNG_URL || 'http://searxng:8080';
    const res = await fetch(`${searxngUrl}/search?q=${q}&format=json`);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const best = data.results[0];
        return { url: best.url, title: best.title, content: best.content };
      }
    }
  } catch (e) {
    console.log(`[OSINT] SearxNG skipping: ${e.message}`);
  }
  return null;
}

async function findLinkedInDecisionMaker(companyName) {
  return fetchSearxNG(`site:linkedin.com/in/ "CEO" OR "Founder" "${companyName}"`);
}

async function findCrunchbase(companyName) {
  return fetchSearxNG(`site:crunchbase.com/organization/ "${companyName}"`);
}

async function findGlassdoor(companyName) {
  return fetchSearxNG(`site:glassdoor.com/Overview/ "${companyName}"`);
}

async function findYelp(companyName) {
  return fetchSearxNG(`site:yelp.com/biz/ "${companyName}"`);
}

// ─── SCRAPE ───────────────────────────────────────────────────────────────────

async function handleScrape(job) {
  const orgId = job.org_id;
  const { auditData, contacts } = await runAudit(job.payload.target);

  const hasEmail = contacts && contacts.length > 0 && contacts.some(c => c.email);
  const hasPhone = contacts && contacts.length > 0 && contacts.some(c => c.phone);

  if (!hasEmail && !hasPhone) {
    console.log(`[Scrape] ${job.payload.target} | SKIPPED: No contact info`);
    return;
  }

  // OSINT Enrichment BEFORE AI
  const clearbit = await getClearbitData(job.payload.target.replace('www.', '').split('.')[0]);
  const osintName = clearbit?.name || job.payload.target;
  
  const [linkedinLead, crunchbase, glassdoor, yelp] = await Promise.all([
    findLinkedInDecisionMaker(osintName),
    findCrunchbase(osintName),
    findGlassdoor(osintName),
    findYelp(osintName)
  ]);

  if (linkedinLead && contacts.length > 0) {
    const parts = linkedinLead.title.split('-');
    const fullName = parts[0].trim().split(' ');
    contacts[0].firstName = fullName[0];
    contacts[0].lastName = fullName.slice(1).join(' ');
    contacts[0].linkedin = linkedinLead.url;
    contacts[0].bio = linkedinLead.content;
    console.log(`[OSINT] Found LinkedIn Lead: ${contacts[0].firstName} ${contacts[0].lastName}`);
  }

  // Inject OSINT into auditData for AI
  if (linkedinLead) auditData.osint_linkedin = linkedinLead;
  if (clearbit) auditData.osint_clearbit = clearbit;
  if (crunchbase) auditData.osint_crunchbase = crunchbase;
  if (glassdoor) auditData.osint_glassdoor = glassdoor;
  if (yelp) auditData.osint_yelp = yelp;

  const aiAnalysis = await analyzeWithCohere(auditData);
  const groqSuggestions = await analyzeWithGroq(auditData);

  const companyName = clearbit?.name || aiAnalysis.companyName || job.payload.target;

  const { data: company, error: companyError } = await supabase.from('companies').insert({
    org_id: orgId,
    name: companyName,
    website_url: job.payload.target,
    industry: aiAnalysis.industry || 'Unknown',
    lead_score: aiAnalysis.leadScore || 50,
    status: 'NEW',
    logo_url: clearbit?.logo || null
  }).select().single();

  if (companyError) {
    throw new Error(`Failed to create company: ${companyError.message}`);
  }

  if (contacts.length > 0) {
    const { error: contactsError } = await supabase.from('contacts').insert(
      contacts.map((c, i) => ({
        org_id: orgId,
        company_id: company.id,
        email: c.email || null,
        first_name: c.firstName || null,
        last_name: c.lastName || null,
        linkedin_url: c.linkedin || null,
        instagram_url: c.instagram || null,
        phone: c.phone || null,
        bio: c.bio || null,
        is_primary: i === 0,
      }))
    );

    if (contactsError) {
      console.error(`[Scrape] Failed to insert contacts for ${company.name}:`, contactsError.message);
    }
  }

  const { data: audit, error: auditError } = await supabase.from('audits').insert({
    org_id: orgId,
    company_id: company.id,
    status: 'COMPLETED',
    total_score: auditData.score
  }).select().single();

  if (auditError) {
    throw new Error(`Failed to create audit: ${auditError.message}`);
  }

  const { error: auditResultError } = await supabase.from('audit_results').insert({
    org_id: orgId,
    audit_id: audit.id,
    category: 'AI_PITCH',
    raw_data: auditData,
    issues_found: { pitch: aiAnalysis.pitch, suggestions: groqSuggestions, issues: auditData.issues }
  });

  if (auditResultError) {
    console.error(`[Scrape] Failed to insert audit results for ${company.name}:`, auditResultError.message);
  }

  console.log(`[Scrape] ${company.name} | Score: ${auditData.score} | Contacts: ${contacts.length}`);

  // Auto-send if score is low enough
  if (auditData.score <= 60 && contacts.length > 0 && contacts[0].email) {
    const { data: orgConfig } = await supabase.from('org_config').select('*').eq('org_id', orgId).single();
    const dailyLimit = orgConfig?.daily_email_limit || 90;

    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase.from('emails')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('direction', 'outbound')
      .gte('created_at', today + 'T00:00:00Z');

    if ((count || 0) < dailyLimit) {
      const targetEmail = contacts[0].email;
      const senderName = orgConfig?.company_name || 'Knight';
      const senderEmail = orgConfig?.sender_email || process.env.RESEND_SENDER_EMAIL || 'hello@knight.ai';

      // Try to use default initial template
      const template = await getDefaultTemplate(orgId, 'initial');
      
      let subject, body;
      if (template) {
        const variables = {
          company_name: company.name,
          contact_name: contacts[0].first_name 
            ? `${contacts[0].first_name} ${contacts[0].last_name || ''}`.trim()
            : 'there',
          sender_name: senderName,
          sender_website: orgConfig?.company_website || '',
          calendly_link: orgConfig?.calendly_link || '',
          industry: company.industry || '',
          audit_score: auditData.score.toString(),
          issues_summary: auditData.issues?.slice(0, 3).join(', ') || 'several areas for improvement',
        };
        subject = renderTemplate(template.subject, variables);
        body = renderTemplate(template.body, variables);
      } else {
        // Fallback to AI-generated pitch
        subject = 'Quick question about your website';
        body = aiAnalysis.pitch;
      }

      console.log(`[Scrape] Auto-sending pitch to ${targetEmail}`);
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error } = await resend.emails.send({
          from: `${senderName} <${senderEmail}>`,
          to: targetEmail,
          subject,
          html: `<div style="font-family: 'Inter', sans-serif; max-width: 600px; line-height: 1.6; color: #111;">
            <p>${body.replace(/\n/g, '<br>')}</p>
            <br>
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;">
            <div style="font-size: 12px; color: #666;">
              <strong>${senderName} Team</strong>
            </div>
          </div>`
        });
        if (error) throw error;

        const { error: emailInsertError } = await supabase.from('emails').insert({
          org_id: orgId,
          company_id: company.id,
          direction: 'outbound',
          subject,
          body_text: body
        });

        if (emailInsertError) {
          console.error('[Scrape] Failed to insert email record:', emailInsertError.message);
        }

        if (companyUpdateError) {
          console.error('[Scrape] Failed to update company status:', companyUpdateError.message);
        }

        console.log(`[Scrape] Pitch sent to ${targetEmail}`);

        const { data: org } = await supabase.from('orgs').select('plan').eq('id', orgId).single();
        if (org?.plan === 'pro') {
          const day3 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
          const day7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          await supabase.from('jobs').insert([
            { org_id: orgId, type: 'SEND_FOLLOWUP', status: 'PENDING', execute_after: day3, payload: { targetEmail, company_id: company.id, step: 2 } },
            { org_id: orgId, type: 'SEND_FOLLOWUP', status: 'PENDING', execute_after: day7, payload: { targetEmail, company_id: company.id, step: 3 } }
          ]);
          console.log(`[Scrape] Queued followups for ${targetEmail}`);
        }
      } catch (err) {
        console.error('[Scrape] Auto-send failed:', err.message);
      }
    }
  }
}

// ─── PROCESS_REPLY ────────────────────────────────────────────────────────────

async function handleProcessReply(job) {
  const { email_id, company_id, body_text } = job.payload;
  const orgId = job.org_id;

  console.log(`[ProcessReply] Company ${company_id}...`);

  const { data: orgConfig } = await supabase.from('org_config').select('*').eq('org_id', orgId).single();
  const companyName = orgConfig?.company_name || 'Knight';

  // Classify intent
  const intentResult = await complete('reply_classification', [{
    role: 'user',
    content: `Analyze this email reply to a cold outreach. Is the prospect rejecting us/not interested? Reply ONLY with "REJECTED" or "INTERESTED". Email: "${body_text}"`,
  }], { temperature: 0.3 });

  const intent = intentResult.content?.trim().toUpperCase();

  if (intent?.includes('REJECTED')) {
    console.log('[ProcessReply] Intent: REJECTED');
    const { error: rejectError } = await supabase.from('companies').update({ status: 'REJECTED', updated_at: new Date().toISOString() }).eq('id', company_id);
    if (rejectError) {
      console.error('[ProcessReply] Failed to update company status:', rejectError.message);
    }

    const { data: audit } = await supabase.from('audits').select('id').eq('company_id', company_id).single();
    if (audit) {
      const { error: auditResultError } = await supabase.from('audit_results').insert({
        audit_id: audit.id,
        org_id: orgId,
        category: 'REJECTED',
        raw_data: {},
        issues_found: { rejection_reason: 'Rejected by client' }
      });

      if (auditResultError) {
        console.error('[ProcessReply] Failed to insert audit result:', auditResultError.message);
      }
    }
    return;
  }

  // Try to use default reply template
  const template = await getDefaultTemplate(orgId, 'reply');
  
  let draftText;
  if (template) {
    const variables = {
      company_name: companyName,
      contact_name: 'there',
      sender_name: companyName,
      sender_website: orgConfig?.company_website || '',
      calendly_link: orgConfig?.calendly_link || '',
      subject: '',
    };
    draftText = renderTemplate(template.body, variables);
  } else {
    // Draft reply via AI Hub
    const prompt = `You are a professional sales closer representing ${companyName}.
A potential client just replied to our cold outreach email.
Read their reply and write a highly professional, persuasive response.
Keep it concise, polite, and persuasive. Sign off as "${companyName} Team".

HARD RULES:
- ANTI-HALLUCINATION: NEVER make up pricing or agree to unrealistic budgets.
- ANTI-HALLUCINATION: NEVER promise services we don't build.

Client Reply:
"${body_text}"

Respond with only the exact text of the email draft. No markdown, no preambles.`;

    try {
      const result = await complete('reply_draft', [
        { role: 'user', content: prompt },
      ]);
      draftText = result.content.trim();
    } catch (err) {
      console.error('[ProcessReply] AI draft failed:', err.message);
      draftText = `Hi,\n\nThanks for your reply. I'd be happy to discuss further.\n\nBest,\n${companyName} Team`;
    }
  }

  try {
    await supabase.from('drafts').insert({
      email_id: email_id,
      draft_text: draftText,
      status: 'pending'
    });
    console.log(`[ProcessReply] Draft generated for email ${email_id}`);
  } catch (err) {
    console.error('[ProcessReply] Draft save failed:', err.message);
  }
}

// ─── SEND_FOLLOWUP ─────────────────────────────────────────────────────────────

async function handleFollowup(job) {
  const { targetEmail, company_id, step } = job.payload;
  const orgId = job.org_id;

  const { data: company } = await supabase.from('companies').select('name, status').eq('id', company_id).single();
  if (!company || company.status !== 'PITCHED') {
    console.log(`[Followup] Skipped ${targetEmail}: status is ${company?.status}`);
    return;
  }

  const { data: orgConfig } = await supabase.from('org_config').select('*').eq('org_id', orgId).single();
  const senderName = orgConfig?.company_name || 'Knight';
  const senderEmail = orgConfig?.sender_email || process.env.RESEND_SENDER_EMAIL || 'hello@knight.ai';

  const { data: contacts } = await supabase.from('contacts').select('first_name').eq('company_id', company_id).limit(1);
  const contactName = (contacts && contacts[0]?.first_name) ? contacts[0].first_name : 'there';

  let subject = step === 2 ? 'Following up' : 'Last check-in';
  let body = step === 2 
    ? `Hi ${contactName},\n\nJust floating this to the top of your inbox. Let me know if you have any questions.\n\nBest,\n${senderName}`
    : `Hi ${contactName},\n\nI won't follow up again, but please reach out if anything changes.\n\nThanks,\n${senderName}`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: `${senderName} <${senderEmail}>`,
      to: targetEmail,
      subject,
      html: `<div style="font-family: 'Inter', sans-serif; max-width: 600px; line-height: 1.6; color: #111;">
        <p>${body.replace(/\n/g, '<br>')}</p>
      </div>`
    });
    if (error) throw error;

    await supabase.from('emails').insert({
      org_id: orgId,
      company_id: company_id,
      direction: 'outbound',
      subject,
      body_text: body
    });

    console.log(`[Followup] Sent step ${step} to ${targetEmail}`);
  } catch (err) {
    console.error('[Followup] Send failed:', err.message);
  }
}
