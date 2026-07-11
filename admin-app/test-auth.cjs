const { createClient } = require('@supabase/supabase-js');
const url = 'https://urysguwrouwjqcqcmzxv.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeXNndXdyb3V3anFjcWNtenh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzY0MzQxMywiZXhwIjoyMDk5MjE5NDEzfQ.zbbHjHI3krhEl2T7VuiMgA46kGDTtsqO5pZtBx61H94';

const WebSocket = require('ws');

async function test() {
  try {
    const supabase = createClient(url, key, {
      realtime: { transport: WebSocket }
    });
    console.log('Testing auth...');
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) console.error('Auth Error:', error);
    else {
      console.log('Auth Users count:', data.users.length);
      data.users.forEach(u => console.log('-', u.email));
    }

    console.log('Testing public.orgs...');
    const { data: orgs, error: err3 } = await supabase.from('orgs').select('*').limit(10);
    if (err3) console.error('Orgs Error:', err3.message);
    else console.log('Orgs count:', orgs.length);
  } catch (e) {
    console.error('Fatal:', e);
  }
}
test();
