import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://urysguwrouwjqcqcmzxv.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeXNndXdyb3V3anFjcWNtenh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzY0MzQxMywiZXhwIjoyMDk5MjE5NDEzfQ.zbbHjHI3krhEl2T7VuiMgA46kGDTtsqO5pZtBx61H94';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

const companies = [
  { name: 'Brightside Agency',     website: 'https://brightsideagency.com',     industry: 'Marketing Agency',     score: 85, status: 'NEW' },
  { name: 'Pixel Perfect Studio',  website: 'https://pixelperfectstudio.co',    industry: 'Web Design',           score: 72, status: 'NEW' },
  { name: 'WebFlow Digital',       website: 'https://webflowdigital.com',       industry: 'Digital Marketing',    score: 91, status: 'PITCHED' },
  { name: 'BluePeak Creative',     website: 'https://bluepeakcreative.com',     industry: 'Branding Agency',      score: 68, status: 'PITCHED' },
  { name: 'Summit Marketing',      website: 'https://summitmarketing.io',       industry: 'SEO Agency',           score: 55, status: 'PITCHED' },
  { name: 'Ironclad Designs',      website: 'https://ironcladdesigns.com',      industry: 'UX Agency',            score: 94, status: 'REPLIED' },
  { name: 'Nova Digital Co.',      website: 'https://novadigital.co',           industry: 'Full-Service Agency',  score: 78, status: 'REPLIED' },
  { name: 'Crestline Media',       website: 'https://crestlinemedia.com',       industry: 'Social Media Agency',  score: 63, status: 'REPLIED' },
  { name: 'Dead End Studios',      website: 'https://deadendstudios.com',       industry: 'Creative Studio',      score: 30, status: 'REJECTED' },
  { name: 'Frostbyte Labs',        website: 'https://frostbytelabs.io',         industry: 'Tech Startup',         score: 45, status: 'REJECTED' },
];

const contacts = [
  { first: 'Sarah',  last: 'Chen',      email: 'sarah@brightsideagency.com' },
  { first: 'Marcus', last: 'Rivera',    email: 'marcus@pixelperfectstudio.co' },
  { first: 'Emily',  last: 'Thompson',  email: 'emily@webflowdigital.com' },
  { first: 'James',  last: 'Okafor',    email: 'james@bluepeakcreative.com' },
  { first: 'Lisa',   last: 'Park',      email: 'lisa@summitmarketing.io' },
  { first: 'David',  last: 'Kowalski',  email: 'david@ironcladdesigns.com' },
  { first: 'Ana',    last: 'Gutierrez', email: 'ana@novadigital.co' },
  { first: 'Tom',    last: 'Bradley',   email: 'tom@crestlinemedia.com' },
  { first: 'Rick',   last: 'Mason',     email: 'rick@deadendstudios.com' },
  { first: 'Nina',   last: 'Volkov',    email: 'nina@frostbytelabs.io' },
];

const pitchSubjects = [
  "Your website is losing you clients — here's how to fix it",
  "Quick audit of {name}: 3 issues killing your conversions",
  "{name} vs competitors: where you're falling behind",
  "We audited {name} — here's what we found",
  "3 things {name} can fix today to get more leads",
  "Your competitors are outranking you — let's change that",
  "{name}'s website score: 47/100 — we can help",
  "We found 12 issues on {name} — here's the fix",
  "How {name} can double their inbound leads",
  "Free audit: {name} has a 6-second load time problem",
];

function pitchBody(name) {
  return `Hi,

I ran a quick audit of ${name}'s website and found some issues that might be costing you clients.

Key findings:
- Load time is ${(2 + Math.random() * 5).toFixed(1)}s (should be under 2s)
- Mobile usability score: ${Math.floor(40 + Math.random() * 50)}/100
- Missing meta descriptions on ${Math.floor(2 + Math.random() * 10)} pages

These are quick fixes that could significantly improve your search rankings and user experience.

Would you be open to a 15-minute call this week to walk through the full audit?

Best,
Knight AI`;
}

const replyBodies = [
  "Thanks for reaching out! This looks interesting. Can you send more details about your pricing?",
  "Hey, I saw your audit. Some of those numbers look off — can you walk me through how you calculated them?",
  "Interesting. We've been looking to improve our site. Let's schedule a call for Thursday?",
  "Hi, this is exactly what we need. Can you send a proposal?",
];

const rejectBodies = [
  "Please remove me from your mailing list.",
  "We're not interested. Don't contact us again.",
];

async function run() {
  // Find org
  const { data: member } = await supabase
    .from('org_members')
    .select('org_id')
    .limit(1)
    .single();

  if (!member) {
    console.error('No org found.');
    process.exit(1);
  }
  const orgId = member.org_id;
  console.log(`Org: ${orgId}`);

  // Clear existing
  const { data: existing } = await supabase.from('companies').select('id').eq('org_id', orgId);
  if (existing && existing.length > 0) {
    const ids = existing.map(c => c.id);
    console.log(`Clearing ${ids.length} existing companies...`);
    const { data: audits } = await supabase.from('audits').select('id').in('company_id', ids);
    if (audits && audits.length > 0) {
      await supabase.from('audit_results').delete().in('audit_id', audits.map(a => a.id));
      await supabase.from('audits').delete().in('company_id', ids);
    }
    await supabase.from('emails').delete().in('company_id', ids);
    await supabase.from('contacts').delete().in('company_id', ids);
    await supabase.from('jobs').delete().eq('org_id', orgId);
    await supabase.from('companies').delete().eq('org_id', orgId);
    console.log('Cleared.');
  }

  for (let i = 0; i < companies.length; i++) {
    const c = companies[i];
    const ct = contacts[i];
    const createdDay = 13 - i;

    console.log(`[${i + 1}/10] ${c.name} (${c.status})`);

    // Company
    const { data: company, error: cErr } = await supabase
      .from('companies')
      .insert({
        org_id: orgId,
        name: c.name,
        website_url: c.website,
        industry: c.industry,
        lead_score: c.score,
        status: c.status,
        ai_pitch: pitchBody(c.name),
        created_at: daysAgo(createdDay),
      })
      .select()
      .single();

    if (cErr) { console.error(`  ERR:`, cErr.message); continue; }

    // Contact
    await supabase.from('contacts').insert({
      company_id: company.id,
      email: ct.email,
      full_name: `${ct.first} ${ct.last}`,
      role: 'Owner',
      is_primary: true,
    });

    // Audit
    const auditScore = Math.floor(30 + Math.random() * 60);
    const { data: audit } = await supabase.from('audits').insert({
      company_id: company.id,
      status: 'COMPLETED',
      total_score: auditScore,
      created_at: daysAgo(createdDay - 1),
    }).select().single();

    // Audit results
    if (audit) {
      await supabase.from('audit_results').insert([
        {
          audit_id: audit.id,
          category: 'Performance',
          raw_data: { loadTime: (2 + Math.random() * 5).toFixed(1) + 's', pageSize: Math.floor(800 + Math.random() * 4000) + 'KB', requests: Math.floor(20 + Math.random() * 80) },
          issues_found: [{ issue: 'Slow load time', severity: 'high', detail: 'Page takes over 3s to load' }],
        },
        {
          audit_id: audit.id,
          category: 'SEO',
          raw_data: { score: Math.floor(30 + Math.random() * 60), metaDesc: Math.random() > 0.5, headings: Math.floor(1 + Math.random() * 5) },
          issues_found: [{ issue: 'Missing meta descriptions', severity: 'medium', detail: 'Several pages lack meta tags' }],
        },
        {
          audit_id: audit.id,
          category: 'Accessibility',
          raw_data: { score: Math.floor(40 + Math.random() * 55), altText: Math.random() > 0.4, contrast: Math.random() > 0.5 },
          issues_found: [{ issue: 'Missing alt text on images', severity: 'low', detail: 'Some images lack alt attributes' }],
        },
      ]);
    }

    // Outbound pitch
    const subject = pitchSubjects[i].replace(/\{name\}/g, c.name);
    await supabase.from('emails').insert({
      company_id: company.id,
      direction: 'outbound',
      subject,
      body_text: pitchBody(c.name),
      created_at: daysAgo(createdDay - 2),
    });

    // Reply / reject
    if (c.status === 'REPLIED' || c.status === 'REJECTED') {
      const isReject = c.status === 'REJECTED';
      const body = isReject ? rejectBodies[i % rejectBodies.length] : replyBodies[i % replyBodies.length];
      await supabase.from('emails').insert({
        company_id: company.id,
        direction: 'inbound',
        subject: `Re: ${subject}`,
        body_text: body,
        created_at: daysAgo(createdDay - 3),
      });
    }

    // Jobs
    const jobBase = { org_id: orgId };
    const jobs = [
      { ...jobBase, type: 'DISCOVER', status: 'COMPLETED', payload: { keyword: c.industry, location: 'US' }, created_at: daysAgo(createdDay), completed_at: daysAgo(createdDay) },
      { ...jobBase, type: 'SCRAPE', status: 'COMPLETED', payload: { url: c.website }, created_at: daysAgo(createdDay - 1), completed_at: daysAgo(createdDay - 1) },
      { ...jobBase, type: 'AUDIT', status: 'COMPLETED', payload: { url: c.website }, created_at: daysAgo(createdDay - 1), completed_at: daysAgo(createdDay - 1) },
      { ...jobBase, type: 'PITCH', status: 'COMPLETED', payload: { company: c.name }, created_at: daysAgo(createdDay - 2), completed_at: daysAgo(createdDay - 2) },
      { ...jobBase, type: 'EMAIL', status: 'COMPLETED', payload: { to: ct.email, subject }, created_at: daysAgo(createdDay - 2), completed_at: daysAgo(createdDay - 2) },
    ];

    if (c.status === 'REPLIED' || c.status === 'REJECTED') {
      jobs.push({ ...jobBase, type: 'PROCESS_REPLY', status: 'COMPLETED', payload: { company: c.name }, created_at: daysAgo(createdDay - 3), completed_at: daysAgo(createdDay - 3) });
    }

    await supabase.from('jobs').insert(jobs);
  }

  console.log('\nDone! 10 test companies seeded.');
}

run().catch(console.error);
