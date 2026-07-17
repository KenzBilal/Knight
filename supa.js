#!/usr/bin/env node
// Usage: node supa.js "table_name" [action] [--filters] [--data]
// Examples:
//   node supa.js orgs select
//   node supa.js orgs select --limit 5
//   node supa.js telegram_leads select --eq org_id=abc123 --limit 10
//   node supa.js org_config select --eq org_id=abc123
//   node supa.js org_config update --eq org_id=abc123 --data '{"tone":"professional"}'
//   node supa.js org_config insert --data '{"org_id":"abc123","tone":"professional"}'
//   node supa.js telegram_leads count --eq org_id=abc123

const fs = require('fs');
const path = require('path');

function loadEnv() {
  const paths = [
    '/home/kenz/Projects/Knight/dashboard/.env.local',
    '/home/kenz/Projects/Knight/worker/.env',
  ];
  const env = {};
  for (const p of paths) {
    if (!fs.existsSync(p)) continue;
    const lines = fs.readFileSync(p, 'utf8').split('\n');
    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const m = t.match(/^([^=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim();
    }
  }
  return env;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node supa.js <table> <select|count|insert|update|delete> [options]');
    console.log('Options: --eq key=val --neq key=val --limit N --offset N --order col:asc|desc --data \'{"key":"val"}\'');
    process.exit(1);
  }

  const table = args[0];
  const action = args[1];
  const opts = {};

  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--eq' && args[i+1]) { const [k,...v] = args[i+1].split('='); opts.eq = opts.eq || {}; opts.eq[k] = v.join('='); i++; }
    else if (args[i] === '--neq' && args[i+1]) { const [k,...v] = args[i+1].split('='); opts.neq = opts.neq || {}; opts.neq[k] = v.join('='); i++; }
    else if (args[i] === '--gt' && args[i+1]) { const [k,...v] = args[i+1].split('='); opts.gt = opts.gt || {}; opts.gt[k] = v.join('='); i++; }
    else if (args[i] === '--lt' && args[i+1]) { const [k,...v] = args[i+1].split('='); opts.lt = opts.lt || {}; opts.lt[k] = v.join('='); i++; }
    else if (args[i] === '--like' && args[i+1]) { const [k,...v] = args[i+1].split('='); opts.like = opts.like || {}; opts.like[k] = v.join('='); i++; }
    else if (args[i] === '--is' && args[i+1]) { const [k,...v] = args[i+1].split('='); opts.is = opts.is || {}; opts.is[k] = v === 'null' ? null : v; i++; }
    else if (args[i] === '--limit' && args[i+1]) { opts.limit = parseInt(args[i+1]); i++; }
    else if (args[i] === '--offset' && args[i+1]) { opts.offset = parseInt(args[i+1]); i++; }
    else if (args[i] === '--order' && args[i+1]) { opts.order = args[i+1]; i++; }
    else if (args[i] === '--data' && args[i+1]) { opts.data = args[i+1]; i++; }
    else if (args[i] === '--select' && args[i+1]) { opts.select = args[i+1]; i++; }
  }

  const env = loadEnv();
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env files');
    process.exit(1);
  }

  const headers = {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Prefer': action === 'count' ? 'count=exact' : action === 'insert' || action === 'update' ? 'return=representation' : undefined,
  };

  let apiUrl = `${url}/rest/v1/${table}`;

  if (action === 'select' || action === 'count') {
    const params = new URLSearchParams();
    if (action === 'count') {
      params.set('select', '*');
      headers['Prefer'] = 'count=exact';
    } else {
      params.set('select', opts.select || '*');
    }
    if (opts.eq) Object.entries(opts.eq).forEach(([k,v]) => params.set(k, `eq.${v}`));
    if (opts.neq) Object.entries(opts.neq).forEach(([k,v]) => params.set(k, `neq.${v}`));
    if (opts.gt) Object.entries(opts.gt).forEach(([k,v]) => params.set(k, `gt.${v}`));
    if (opts.lt) Object.entries(opts.lt).forEach(([k,v]) => params.set(k, `lt.${v}`));
    if (opts.like) Object.entries(opts.like).forEach(([k,v]) => params.set(k, `like.${v}`));
    if (opts.is) Object.entries(opts.is).forEach(([k,v]) => params.set(k, v === null ? 'is.null' : `eq.${v}`));
    if (opts.limit) params.set('limit', opts.limit);
    if (opts.offset) params.set('offset', opts.offset);
    if (opts.order) {
      const [col, dir] = opts.order.split(':');
      params.set('order', `${col}.${dir || 'asc'}`);
    }
    apiUrl += '?' + params.toString();
  }

  const fetchOpts = { method: action === 'insert' || action === 'update' || action === 'delete' ? 'POST' : 'GET', headers };

  if (action === 'insert') {
    fetchOpts.body = opts.data;
    apiUrl += '?select=*';
  } else if (action === 'update') {
    fetchOpts.method = 'PATCH';
    fetchOpts.body = opts.data;
    const params = new URLSearchParams();
    if (opts.eq) Object.entries(opts.eq).forEach(([k,v]) => params.set(k, `eq.${v}`));
    if (params.toString()) apiUrl += '?' + params.toString();
  } else if (action === 'delete') {
    fetchOpts.method = 'DELETE';
    const params = new URLSearchParams();
    if (opts.eq) Object.entries(opts.eq).forEach(([k,v]) => params.set(k, `eq.${v}`));
    if (params.toString()) apiUrl += '?' + params.toString();
  }

  const res = await fetch(apiUrl, fetchOpts);

  if (action === 'count') {
    const count = res.headers.get('content-range')?.split('/')[1];
    console.log(JSON.stringify({ count: parseInt(count) || 0 }));
    return;
  }

  const text = await res.text();
  try {
    const data = JSON.parse(text);
    console.log(JSON.stringify(data, null, 2));
  } catch {
    console.log(text);
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
