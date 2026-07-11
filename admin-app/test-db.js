const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

async function test() {
  const content = fs.readFileSync('/home/kenz/Projects/Knight/worker/.env', 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  });

  console.log('SUPABASE_URL:', env.SUPABASE_URL);
  
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing keys');
    return;
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
    console.log('Auth Users:', authErr ? authErr.message : authData.users.length);

    const { data: users, error: err1 } = await supabase.from('users').select('id').limit(10);
    console.log('Public Users Table:', err1 ? err1.message : users.length);

    const { data: profiles, error: err2 } = await supabase.from('profiles').select('id').limit(10);
    console.log('Public Profiles Table:', err2 ? err2.message : profiles.length);

    const { data: orgs, error: err3 } = await supabase.from('orgs').select('id').limit(10);
    console.log('Public Orgs Table:', err3 ? err3.message : orgs.length);

    const { data: companies, error: err4 } = await supabase.from('companies').select('id').limit(10);
    console.log('Public Companies Table:', err4 ? err4.message : companies.length);
  } catch(e) {
    console.error('Fatal Error:', e);
  }
}
test();
