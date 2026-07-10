import { createClient } from '@supabase/supabase-js';
import { CohereClient } from 'cohere-ai';
import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import ws from 'ws';
import { runAudit, analyzeWithCohere, analyzeWithGroq } from './shared_audit.js';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws }
});

let jobProcessing = false;
const jobQueue = [];
const JOB_DELAY_MS = 6000;

console.log('[Knight Worker] Starting...');

// Subscribe to all new jobs across all orgs
supabase
  .channel('jobs-channel')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'jobs' }, (payload) => {
    if (payload.new.status === 'PENDING') {
      console.log(`[Job] New job ${payload.new.id} (${payload.new.type}) for org ${payload.new.org_id}`);
      jobQueue.push(payload.new);
      processQueue();
    }
  })
  .subscribe(async () => {
    console.log('[Knight Worker] Connected to Supabase realtime');
    await fetchPendingJobs();
  });

setInterval(runDailyCleanup, 1000 * 60 * 60 * 24);
setTimeout(runDailyCleanup, 5000);

async function runDailyCleanup() {
  console.log('[Cleanup] Running daily cleanup for 30-day stale leads...');
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('companies')
    .select('id, org_id')
    .eq('status', 'PITCHED')
    .lt('created_at', thirtyDaysAgo);

  if (data && data.length > 0) {
    for (const company of data) {
      await supabase.from('companies').update({ status: 'REJECTED' }).eq('id', company.id);
      const { data: audit } = await supabase.from('audits').select('id').eq('company_id', company.id).single();
      if (audit) {
        await supabase.from('audit_results').insert({
          audit_id: audit.id,
          org_id: company.org_id,
          category: 'REJECTED',
          raw_data: {},
          issues_found: { rejection_reason: 'No reply after 30 days' }
        });
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
    .order('created_at', { ascending: true });

  if (data && data.length > 0) {
    console.log(`[Worker] Found ${data.length} pending jobs`);
    for (const job of data) {
      if (!jobQueue.find(j => j.id === job.id)) jobQueue.push(job);
    }
    processQueue();
  }
}

async function processQueue() {
  if (jobProcessing || jobQueue.length === 0) return;
  jobProcessing = true;
  const job = jobQueue.shift();
  try {
    await handleJob(job);
  } catch (e) {
    console.error('[Worker] Queue error:', e.message);
  }
  if (jobQueue.length > 0) {
    console.log(`[Worker] Queue: ${jobQueue.length} remaining. Waiting ${JOB_DELAY_MS / 1000}s...`);
    await new Promise(r => setTimeout(r, JOB_DELAY_MS));
  }
  jobProcessing = false;
  processQueue();
}

async function handleJob(job) {
  if (job.status !== 'PENDING') return;
  console.log(`[Job] ${job.type} ${job.id} | org: ${job.org_id}`);

  await supabase.from('jobs').update({ status: 'RUNNING', updated_at: new Date().toISOString() }).eq('id', job.id);

  try {
    if (job.type === 'DISCOVER') {
      await handleDiscover(job);
    } else if (job.type === 'PROCESS_REPLY') {
      await handleProcessReply(job);
    } else {
      await handleScrape(job);
    }
    await supabase.from('jobs').update({ status: 'COMPLETED', updated_at: new Date().toISOString() }).eq('id', job.id);
  } catch (error) {
    console.error(`[Job] ${job.id} failed:`, error.message);
    await supabase.from('jobs').update({ status: 'FAILED', updated_at: new Date().toISOString() }).eq('id', job.id);
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
    .single();
  return data;
}

// ─── DISCOVER ─────────────────────────────────────────────────────────────────

async function handleDiscover(job) {
  const { keyword, location } = job.payload;
  const query = `${keyword} ${location || ''}`.trim();
  console.log(`[Discover] Searching: "${query}"`);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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

        await bizPage.close();

        if (website && !website.includes('google.com') && !website.includes('facebook.com')) {
          const cleanUrl = new URL(website).hostname.replace('www.', '');
          await supabase.from('jobs').insert({
            org_id: job.org_id,
            type: 'SCRAPE',
            status: 'PENDING',
            payload: { target: cleanUrl, source: `discovery:${query}` }
          });
          queued++;
        }
      } catch {}
    }

    console.log(`[Discover] Queued ${queued} sites for audit`);
  } finally {
    await browser.close();
  }
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

  const aiAnalysis = await analyzeWithCohere(auditData);
  const groqSuggestions = await analyzeWithGroq(auditData);

  const { data: company } = await supabase.from('companies').insert({
    org_id: orgId,
    name: aiAnalysis.companyName || job.payload.target,
    website_url: job.payload.target,
    industry: aiAnalysis.industry || 'Unknown',
    lead_score: aiAnalysis.leadScore || 50,
    status: 'NEW',
  }).select().single();

  if (contacts.length > 0) {
    await supabase.from('contacts').insert(
      contacts.map((c, i) => ({
        org_id: orgId,
        company_id: company.id,
        email: c.email || null,
        first_name: c.firstName || null,
        last_name: c.lastName || null,
        linkedin_url: c.linkedin || null,
        instagram_url: c.instagram || null,
        phone: c.phone || null,
        is_primary: i === 0,
      }))
    );
  }

  const { data: audit } = await supabase.from('audits').insert({
    org_id: orgId,
    company_id: company.id,
    status: 'COMPLETED',
    total_score: auditData.score
  }).select().single();

  await supabase.from('audit_results').insert({
    org_id: orgId,
    audit_id: audit.id,
    category: 'AI_PITCH',
    raw_data: auditData,
    issues_found: { pitch: aiAnalysis.pitch, suggestions: groqSuggestions, issues: auditData.issues }
  });

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

        await supabase.from('emails').insert({
          org_id: orgId,
          company_id: company.id,
          direction: 'outbound',
          subject,
          body_text: body
        });
        await supabase.from('companies').update({ status: 'PITCHED' }).eq('id', company.id);
        console.log(`[Scrape] Pitch sent to ${targetEmail}`);
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

  const openai = (await import('openai')).default;
  const client = new openai({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  // Classify intent
  const intentCompletion = await client.chat.completions.create({
    messages: [{
      role: 'user',
      content: `Analyze this email reply to a cold outreach. Is the prospect rejecting us/not interested? Reply ONLY with "REJECTED" or "INTERESTED". Email: "${body_text}"`
    }],
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    temperature: 0.3,
  });

  const intent = intentCompletion.choices[0]?.message?.content?.trim().toUpperCase();

  if (intent?.includes('REJECTED')) {
    console.log('[ProcessReply] Intent: REJECTED');
    await supabase.from('companies').update({ status: 'REJECTED' }).eq('id', company_id);
    const { data: audit } = await supabase.from('audits').select('id').eq('company_id', company_id).single();
    if (audit) {
      await supabase.from('audit_results').insert({
        audit_id: audit.id,
        org_id: orgId,
        category: 'REJECTED',
        raw_data: {},
        issues_found: { rejection_reason: 'Rejected by client' }
      });
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
    // Draft reply via Gemini
    const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });

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
      const response = await model.generateContent(prompt);
      draftText = response.response.text().trim();
    } catch (err) {
      console.error('[ProcessReply] Gemini draft failed:', err.message);
      draftText = `Hi,\n\nThanks for your reply. I'd be happy to discuss further.\n\nBest,\n${companyName} Team`;
    }
  }

  try {
    await supabase.from('drafts').insert({
      org_id: orgId,
      email_id: email_id,
      draft_text: draftText,
      status: 'pending'
    });
    console.log(`[ProcessReply] Draft generated for email ${email_id}`);
  } catch (err) {
    console.error('[ProcessReply] Draft save failed:', err.message);
  }
}
