require('dotenv').config({ path: '/home/kenz/Projects/Knight/worker/.env' });
const { createClient } = require('@supabase/supabase-js');

async function test() {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.auth.admin.listUsers();
    console.log('Auth Users:', data.users.length);
    
    // Check if there is a 'users' or 'profiles' table
    const { data: profiles, error: err2 } = await supabase.from('users').select('*');
    if (profiles) console.log('Public Users Table:', profiles.length);
    else console.log('No public users table or error:', err2);
  } catch (e) {
    console.error(e);
  }
}
test();
