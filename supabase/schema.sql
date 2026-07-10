-- ============================================================
-- KNIGHT — Multi-Tenant Database Schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Requires: Supabase Auth already enabled.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- ORGANIZATIONS (tenants)
-- ============================================================
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text not null default 'free' check (plan in ('free','starter','pro','agency')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ORG MEMBERS (users belong to orgs)
-- ============================================================
create table if not exists public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','member')),
  unique(org_id, user_id)
);

-- ============================================================
-- ORG API KEYS (per-org, BYOK)
-- ============================================================
create table if not exists public.org_api_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  provider text not null,
  key_encrypted text not null,
  created_at timestamptz not null default now(),
  unique(org_id, provider)
);

-- ============================================================
-- ORG CONFIG (per-org engine settings)
-- ============================================================
create table if not exists public.org_config (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade unique,
  company_name text,
  company_website text,
  services_offered jsonb default '[]'::jsonb,
  tone text default 'professional',
  calendly_link text,
  sniper_keywords jsonb default '[]'::jsonb,
  sender_email text default 'hello',
  sender_domain text,
  auto_send_threshold integer default 60,
  daily_email_limit integer default 90,
  telegram_enabled boolean default false,
  telegram_phone text,
  telegram_session text,
  telegram_bot_token text,
  telegram_admin_chat_id text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- JOBS (work queue)
-- ============================================================
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  type text not null,
  status text not null default 'PENDING',
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  error text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists jobs_org_status_idx on public.jobs(org_id, status);
create index if not exists jobs_created_at_idx on public.jobs(created_at);

-- ============================================================
-- COMPANIES (discovered leads)
-- ============================================================
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  website_url text,
  industry text,
  lead_score integer default 50,
  status text not null default 'NEW',
  ai_pitch text,
  ai_suggestions text,
  created_at timestamptz not null default now()
);

create index if not exists companies_org_status_idx on public.companies(org_id, status);
create index if not exists companies_org_id_idx on public.companies(org_id);

-- ============================================================
-- CONTACTS
-- ============================================================
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text,
  phone text,
  linkedin_url text,
  instagram_url text,
  is_primary boolean default false
);

create index if not exists contacts_company_idx on public.contacts(company_id);

-- ============================================================
-- AUDITS
-- ============================================================
create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  status text not null default 'PENDING',
  total_score integer,
  created_at timestamptz not null default now()
);

create index if not exists audits_company_idx on public.audits(company_id);

-- ============================================================
-- AUDIT RESULTS
-- ============================================================
create table if not exists public.audit_results (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  category text,
  raw_data jsonb,
  issues_found jsonb
);

-- ============================================================
-- EMAILS
-- ============================================================
create table if not exists public.emails (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  direction text not null,
  subject text,
  body_text text,
  body_html text,
  created_at timestamptz not null default now()
);

create index if not exists emails_company_idx on public.emails(company_id);

-- ============================================================
-- DRAFTS (AI-generated replies)
-- ============================================================
create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  email_id uuid not null references public.emails(id) on delete cascade,
  draft_text text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- ============================================================
-- TELEGRAM LEADS
-- ============================================================
create table if not exists public.telegram_leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  chat_id bigint unique,
  username text,
  full_name text,
  phone text,
  email text,
  instagram text,
  location text,
  website text,
  source_group text,
  category text,
  status text not null default 'PENDING',
  ai_summary text,
  chat_history jsonb default '[]'::jsonb,
  pitch_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists telegram_leads_org_idx on public.telegram_leads(org_id);
create index if not exists telegram_leads_chat_idx on public.telegram_leads(chat_id);
create index if not exists telegram_leads_status_idx on public.telegram_leads(status);

-- ============================================================
-- ACTIVITY LOG
-- ============================================================
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  type text not null,
  message text not null,
  level text not null default 'info',
  created_at timestamptz not null default now()
);

create index if not exists activity_log_org_idx on public.activity_log(org_id);

-- ============================================================
-- ENGINE CONTROL (per-org engine state)
-- ============================================================
create table if not exists public.engine_control (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade unique,
  is_running boolean default false,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.org_api_keys enable row level security;
alter table public.org_config enable row level security;
alter table public.jobs enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.audits enable row level security;
alter table public.audit_results enable row level security;
alter table public.emails enable row level security;
alter table public.drafts enable row level security;
alter table public.telegram_leads enable row level security;
alter table public.activity_log enable row level security;
alter table public.engine_control enable row level security;

-- ORGS: users can read/update their own orgs
create policy "orgs_select_member" on public.orgs
  for select using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = orgs.id
      and org_members.user_id = auth.uid()
    )
  );

-- ORG_MEMBERS: users can see members of their own org
create policy "org_members_select_own" on public.org_members
  for select using (
    exists (
      select 1 from public.org_members as om
      where om.org_id = org_members.org_id
      and om.user_id = auth.uid()
    )
  );

-- ORG_API_KEYS: only service role can access (never expose to client)
create policy "org_api_keys_no_public" on public.org_api_keys
  for all to anon using (false);

-- ORG_CONFIG: users can read their own org config
create policy "org_config_select_own" on public.org_config
  for select using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = org_config.org_id
      and org_members.user_id = auth.uid()
    )
  );

-- JOBS: users can see jobs for their own org
create policy "jobs_select_own" on public.jobs
  for select using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = jobs.org_id
      and org_members.user_id = auth.uid()
    )
  );

-- COMPANIES: users can manage companies in their own org
create policy "companies_all_own" on public.companies
  for all using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = companies.org_id
      and org_members.user_id = auth.uid()
    )
  );

-- CONTACTS: users can see contacts for their own org's companies
create policy "contacts_select_own" on public.contacts
  for select using (
    exists (
      select 1 from public.companies
      join public.org_members on org_members.org_id = companies.org_id
      where companies.id = contacts.company_id
      and org_members.user_id = auth.uid()
    )
  );

-- AUDITS: users can see audits for their own org's companies
create policy "audits_select_own" on public.audits
  for select using (
    exists (
      select 1 from public.companies
      join public.org_members on org_members.org_id = companies.org_id
      where companies.id = audits.company_id
      and org_members.user_id = auth.uid()
    )
  );

-- AUDIT_RESULTS: users can see results for their own org's audits
create policy "audit_results_select_own" on public.audit_results
  for select using (
    exists (
      select 1 from public.audits
      join public.companies on companies.id = audits.company_id
      join public.org_members on org_members.org_id = companies.org_id
      where audits.id = audit_results.audit_id
      and org_members.user_id = auth.uid()
    )
  );

-- EMAILS: users can see emails for their own org's companies
create policy "emails_select_own" on public.emails
  for select using (
    exists (
      select 1 from public.companies
      join public.org_members on org_members.org_id = companies.org_id
      where companies.id = emails.company_id
      and org_members.user_id = auth.uid()
    )
  );

-- DRAFTS: users can see drafts for their own org
create policy "drafts_select_own" on public.drafts
  for select using (
    exists (
      select 1 from public.emails
      join public.companies on companies.id = emails.company_id
      join public.org_members on org_members.org_id = companies.org_id
      where emails.id = drafts.email_id
      and org_members.user_id = auth.uid()
    )
  );

-- TELEGRAM_LEADS: users can see leads for their own org
create policy "telegram_leads_all_own" on public.telegram_leads
  for all using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = telegram_leads.org_id
      and org_members.user_id = auth.uid()
    )
  );

-- ACTIVITY_LOG: users can see logs for their own org
create policy "activity_log_select_own" on public.activity_log
  for select using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = activity_log.org_id
      and org_members.user_id = auth.uid()
    )
  );

-- ENGINE_CONTROL: users can see engine state for their own org
create policy "engine_control_select_own" on public.engine_control
  for select using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = engine_control.org_id
      and org_members.user_id = auth.uid()
    )
  );

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table public.jobs;
alter publication supabase_realtime add table public.companies;
alter publication supabase_realtime add table public.telegram_leads;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Auto-create org on user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  org_name text;
  org_id uuid;
begin
  org_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));

  insert into public.orgs (name, slug)
  values (org_name, lower(replace(org_name, ' ', '-')) || '-' || substr(gen_random_uuid()::text, 1, 6))
  returning id into org_id;

  insert into public.org_members (org_id, user_id, role)
  values (org_id, new.id, 'owner');

  insert into public.org_config (org_id)
  values (org_id);

  insert into public.engine_control (org_id)
  values (org_id);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
