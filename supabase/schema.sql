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
  lemon_customer_id text unique,
  lemon_subscription_id text unique,
  lemon_subscription_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ORG MEMBERS (users belong to orgs)
-- ============================================================
create table if not exists public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','admin','member')),
  joined_at timestamptz default now(),
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
  telegram_mode text,
  telegram_phone text,
  telegram_session text,
  telegram_bot_token text,
  telegram_admin_chat_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists jobs_org_status_idx on public.jobs(org_id, status);
create index if not exists jobs_created_at_idx on public.jobs(created_at);
create index if not exists jobs_status_created_idx on public.jobs(status, created_at);

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists companies_org_status_idx on public.companies(org_id, status);
create index if not exists companies_org_id_idx on public.companies(org_id);

-- ============================================================
-- CONTACTS
-- ============================================================
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete cascade,
  email text,
  phone text,
  linkedin_url text,
  instagram_url text,
  first_name text,
  last_name text,
  full_name text,
  role text,
  is_primary boolean default false
);

create index if not exists contacts_company_idx on public.contacts(company_id);
create index if not exists contacts_org_idx on public.contacts(org_id);

-- ============================================================
-- AUDITS
-- ============================================================
create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete cascade,
  status text not null default 'PENDING',
  total_score integer,
  created_at timestamptz not null default now()
);

create index if not exists audits_company_idx on public.audits(company_id);
create index if not exists audits_org_idx on public.audits(org_id);

-- ============================================================
-- AUDIT RESULTS
-- ============================================================
create table if not exists public.audit_results (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits(id) on delete cascade,
  org_id uuid references public.orgs(id) ON DELETE CASCADE,
  category text,
  raw_data jsonb,
  issues_found jsonb
);

create index if not exists idx_audit_results_org ON public.audit_results(org_id);

-- ============================================================
-- EMAILS
-- ============================================================
create table if not exists public.emails (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  org_id uuid references public.orgs(id) ON DELETE CASCADE,
  direction text not null,
  subject text,
  body_text text,
  body_html text,
  created_at timestamptz not null default now()
);

create index if not exists emails_company_idx on public.emails(company_id);
create index if not exists idx_emails_org ON public.emails(org_id);

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
create index if not exists telegram_leads_status_updated_idx on public.telegram_leads(status, updated_at);

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
-- USAGE TRACKING
-- ============================================================
create table if not exists public.usage_tracking (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  period_start timestamptz not null,
  period_end timestamptz not null,
  emails_sent integer default 0,
  audits_run integer default 0,
  created_at timestamptz not null default now()
);

create index if not exists usage_tracking_org_idx on public.usage_tracking(org_id);

-- ============================================================
-- EMAIL DOMAINS (custom sender domains)
-- ============================================================
create table if not exists public.email_domains (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  domain text not null,
  status text not null default 'pending' check (status in ('pending','verified','failed')),
  verification_token text,
  dkim_record text,
  spf_record text,
  dmarc_record text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(org_id, domain)
);

create index if not exists email_domains_org_idx on public.email_domains(org_id);

-- ============================================================
-- EMAIL TEMPLATES
-- ============================================================
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  type text not null check (type in ('initial','reply','follow_up')),
  subject text not null,
  body text not null,
  is_default boolean default false,
  variables jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists email_templates_org_idx on public.email_templates(org_id);

-- ============================================================
-- ORG INVITES
-- ============================================================
create table if not exists public.org_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin','member')),
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  invited_by uuid not null references auth.users(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists org_invites_org_idx on public.org_invites(org_id);
create index if not exists org_invites_token_idx on public.org_invites(token);

-- ============================================================
-- PLANS
-- ============================================================
create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  price_monthly integer not null,
  email_limit integer not null,
  features jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- AI HUB (system-level AI keys + task routing)
-- ============================================================
create table if not exists public.ai_keys (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  label text not null,
  key_value text not null,
  is_active boolean default true,
  disabled_until timestamptz,
  error_count integer default 0,
  last_used_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_ai_keys_provider on public.ai_keys(provider, is_active);

create table if not exists public.ai_config (
  id uuid primary key default gen_random_uuid(),
  task_type text not null unique,
  task_label text not null,
  provider text not null,
  model text not null,
  cooldown_minutes integer default 30,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  subject text not null,
  category text not null default 'general',
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_tickets_org_idx on public.support_tickets(org_id);

-- ============================================================
-- SUPPORT REPLIES
-- ============================================================
create table if not exists public.support_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_type text not null check (sender_type in ('user','admin')),
  sender_id uuid not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists support_replies_ticket_idx on public.support_replies(ticket_id);

-- ============================================================
-- LANDING CONTENT
-- ============================================================
create table if not exists public.landing_content (
  id uuid primary key default gen_random_uuid(),
  section text unique not null,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CONTACT SUBMISSIONS
-- ============================================================
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  work_email text not null,
  company_name text,
  team_size text,
  use_case text,
  annual_revenue text,
  current_workflow text,
  contact_method text,
  status text not null default 'new' check (status in ('new','contacted','qualified','converted')),
  created_at timestamptz not null default now()
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
alter table public.usage_tracking enable row level security;
alter table public.email_domains enable row level security;
alter table public.email_templates enable row level security;
alter table public.org_invites enable row level security;
alter table public.plans enable row level security;
alter table public.ai_keys enable row level security;
alter table public.ai_config enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_replies enable row level security;
alter table public.landing_content enable row level security;
alter table public.contact_submissions enable row level security;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- ORGS: users can read their own orgs
create policy "orgs_select_member" on public.orgs
  for select using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = orgs.id
      and org_members.user_id = auth.uid()
    )
  );

-- ORGS: admin can update org settings
create policy "orgs_update_admin" on public.orgs
  for update using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = orgs.id
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin')
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

-- ORG_MEMBERS: admin can insert members
create policy "org_members_insert_admin" on public.org_members
  for insert with check (
    exists (
      select 1 from public.org_members
      where org_members.org_id = org_members.org_id
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin')
    )
  );

-- ORG_MEMBERS: owner can update roles
create policy "org_members_update_owner" on public.org_members
  for update using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = org_members.org_id
      and org_members.user_id = auth.uid()
      and org_members.role = 'owner'
    )
  );

-- ORG_MEMBERS: owner can delete members
create policy "org_members_delete_owner" on public.org_members
  for delete using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = org_members.org_id
      and org_members.user_id = auth.uid()
      and org_members.role = 'owner'
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

-- ORG_CONFIG: admin can update config
create policy "org_config_update_admin" on public.org_config
  for update using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = org_config.org_id
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin')
    )
  );

-- ORG_CONFIG: admin can insert config
create policy "org_config_insert_admin" on public.org_config
  for insert with check (
    exists (
      select 1 from public.org_members
      where org_members.org_id = org_config.org_id
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin')
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

-- JOBS: admin can insert jobs
create policy "jobs_insert_admin" on public.jobs
  for insert with check (
    exists (
      select 1 from public.org_members
      where org_members.org_id = jobs.org_id
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin')
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

-- CONTACTS: users can manage contacts for their own org's companies
create policy "contacts_all_own" on public.contacts
  for all using (
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

-- AUDITS: service role can insert (worker creates audits)
create policy "audits_insert_service" on public.audits
  for insert to service_role with check (true);

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

-- AUDIT_RESULTS: service role can insert (worker creates results)
create policy "audit_results_insert_service" on public.audit_results
  for insert to service_role with check (true);

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

-- EMAILS: service role can insert (worker creates emails)
create policy "emails_insert_service" on public.emails
  for insert to service_role with check (true);

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

-- DRAFTS: service role can insert (worker creates drafts)
create policy "drafts_insert_service" on public.drafts
  for insert to service_role with check (true);

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

-- ENGINE_CONTROL: admin can update engine state
create policy "engine_control_update_admin" on public.engine_control
  for update using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = engine_control.org_id
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin')
    )
  );

-- USAGE_TRACKING: users can see usage for their own org
create policy "usage_tracking_select_own" on public.usage_tracking
  for select using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = usage_tracking.org_id
      and org_members.user_id = auth.uid()
    )
  );

-- EMAIL_DOMAINS: users can manage domains for their own org
create policy "email_domains_all_own" on public.email_domains
  for all using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = email_domains.org_id
      and org_members.user_id = auth.uid()
    )
  );

-- EMAIL_TEMPLATES: users can manage templates for their own org
create policy "email_templates_all_own" on public.email_templates
  for all using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = email_templates.org_id
      and org_members.user_id = auth.uid()
    )
  );

-- ORG_INVITES: users can see invites for their own org
create policy "org_invites_select_own" on public.org_invites
  for select using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = org_invites.org_id
      and org_members.user_id = auth.uid()
    )
  );

-- ORG_INVITES: admin can insert invites
create policy "org_invites_insert_admin" on public.org_invites
  for insert with check (
    exists (
      select 1 from public.org_members
      where org_members.org_id = org_invites.org_id
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin')
    )
  );

-- ORG_INVITES: admin can delete invites
create policy "org_invites_delete_admin" on public.org_invites
  for delete using (
    exists (
      select 1 from public.org_members
      where org_members.org_id = org_invites.org_id
      and org_members.user_id = auth.uid()
      and org_members.role in ('owner', 'admin')
    )
  );

-- PLANS: anyone can read plans (public pricing page)
create policy "plans_select_all" on public.plans
  for select using (true);

-- AI_KEYS: service role only
create policy "ai_keys_service_role" on public.ai_keys
  for all using (true);

-- AI_CONFIG: service role only
create policy "ai_config_service_role" on public.ai_config
  for all using (true);

-- SUPPORT TICKETS: users can see their own tickets
create policy "support_tickets_select_own" on public.support_tickets
  for select using (
    user_id = auth.uid()
  );

-- SUPPORT TICKETS: users can insert their own tickets
create policy "support_tickets_insert_own" on public.support_tickets
  for insert with check (
    user_id = auth.uid()
  );

-- SUPPORT TICKETS: users can update their own tickets
create policy "support_tickets_update_own" on public.support_tickets
  for update using (
    user_id = auth.uid()
  );

-- SUPPORT REPLIES: users can see replies on their own tickets
create policy "support_replies_select_own" on public.support_replies
  for select using (
    exists (
      select 1 from public.support_tickets
      where support_tickets.id = support_replies.ticket_id
      and support_tickets.user_id = auth.uid()
    )
  );

-- SUPPORT REPLIES: users can insert replies on their own tickets
create policy "support_replies_insert_own" on public.support_replies
  for insert with check (
    exists (
      select 1 from public.support_tickets
      where support_tickets.id = support_replies.ticket_id
      and support_tickets.user_id = auth.uid()
    )
  );

-- LANDING_CONTENT: service role only (admin-managed)
create policy "landing_content_service_role" on public.landing_content
  for all using (true);

-- CONTACT_SUBMISSIONS: anyone can insert (public contact form)
create policy "contact_submissions_insert_anon" on public.contact_submissions
  for insert to anon with check (true);

-- CONTACT_SUBMISSIONS: service role can read
create policy "contact_submissions_select_service" on public.contact_submissions
  for select to service_role using (true);

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
