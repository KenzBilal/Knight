import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://urysguwrouwjqcqcmzxv.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeXNndXdyb3V3anFjcWNtenh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzY0MzQxMywiZXhwIjoyMDk5MjE5NDEzfQ.zbbHjHI3krhEl2T7VuiMgA46kGDTtsqO5pZtBx61H94';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const ORG_ID = '3ca23b08-5ff2-479b-9b59-f6420640ae34';

const companies = [
  { id: 'b96a2b92-d73e-439b-91d5-6aa1cd09a078', name: 'Brightside Agency', score: 42 },
  { id: 'fce5adc0-eb17-4c08-9697-747e25617225', name: 'Pixel Perfect Studio', score: 67 },
  { id: '9f483774-96c0-45b2-8291-e03186a9f1d0', name: 'WebFlow Digital', score: 89 },
  { id: 'ab5d8652-9995-40d4-aa65-282332d62ea8', name: 'BluePeak Creative', score: 55 },
  { id: 'baef7254-cb55-41b1-83a2-3f692afb50b2', name: 'Summit Marketing', score: 38 },
  { id: 'bd1f9813-ecdc-4f56-9781-a594be0a868c', name: 'Ironclad Designs', score: 91 },
  { id: 'eb25f842-0f63-4fe5-a584-b9744ee3b63a', name: 'Nova Digital Co.', score: 73 },
  { id: 'e6c425bb-d435-457b-b713-999d7fb6e177', name: 'Crestline Media', score: 58 },
  { id: '805e5fff-0e93-4e77-b4b9-baa831d311ec', name: 'Dead End Studios', score: 29 },
  { id: 'ead88a63-3035-480f-8f0a-e8a620933edf', name: 'Frostbyte Labs', score: 56 },
];

function randomBetween(a, b) { return Math.floor(a + Math.random() * (b - a)); }

async function run() {
  for (let i = 0; i < companies.length; i++) {
    const c = companies[i];
    const auditDate = `2026-07-0${10 - i}T12:00:00+00:00`;

    console.log(`[${i + 1}/10] Audit for ${c.name} (score: ${c.score})`);

    const { data: audit, error } = await supabase
      .from('audits')
      .insert({
        org_id: ORG_ID,
        company_id: c.id,
        status: 'COMPLETED',
        total_score: c.score,
        created_at: auditDate,
      })
      .select()
      .single();

    if (error) { console.error(`  ERR:`, error.message); continue; }

    await supabase.from('audit_results').insert([
      {
        audit_id: audit.id,
        category: 'Performance',
        raw_data: { loadTime: `${(2 + Math.random() * 5).toFixed(1)}s`, pageSize: `${randomBetween(800, 4800)}KB`, requests: randomBetween(20, 100) },
        issues_found: [{ issue: 'Slow load time', severity: 'high', detail: 'Page takes over 3s to load' }],
      },
      {
        audit_id: audit.id,
        category: 'SEO',
        raw_data: { score: randomBetween(30, 90), metaDesc: Math.random() > 0.5, headings: randomBetween(1, 6) },
        issues_found: [{ issue: 'Missing meta descriptions', severity: 'medium', detail: 'Several pages lack meta tags' }],
      },
      {
        audit_id: audit.id,
        category: 'Accessibility',
        raw_data: { score: randomBetween(40, 95), altText: Math.random() > 0.4, contrast: Math.random() > 0.5 },
        issues_found: [{ issue: 'Missing alt text on images', severity: 'low', detail: 'Some images lack alt attributes' }],
      },
    ]);
  }

  // Verify
  const { count } = await supabase.from('audits').select('*', { count: 'exact', head: true });
  console.log(`\nDone! Total audits in DB: ${count}`);
}

run().catch(console.error);
