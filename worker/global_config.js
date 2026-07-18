import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let _cache = null;
let _expiry = 0;

export async function getGlobalConfig(key, fallback = null) {
  if (Date.now() > _expiry) {
    try {
      const { data } = await supabase.from('global_config').select('key, value');
      if (data) {
        _cache = {};
        data.forEach(r => { _cache[r.key] = r.value; });
        _expiry = Date.now() + 60_000;
      }
    } catch { /* use stale cache */ }
  }
  const val = _cache?.[key];
  if (val === undefined || val === null) return fallback;
  return typeof val === 'string' ? val.replace(/^"|"$/g, '') : val;
}
