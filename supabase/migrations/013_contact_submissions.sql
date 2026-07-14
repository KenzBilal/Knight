-- Contact Submissions (Sales Inquiries)
-- Migration 013: contact_submissions

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  work_email text not null,
  company_name text not null,
  team_size text not null default '',
  use_case text not null default '',
  annual_revenue text not null default '',
  current_workflow text not null default '',
  contact_method text not null default 'email' check (contact_method in ('email', 'video', 'phone')),
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'converted', 'archived')),
  notes text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_contact_submissions_status on public.contact_submissions(status);
create index if not exists idx_contact_submissions_email on public.contact_submissions(work_email);
create index if not exists idx_contact_submissions_created on public.contact_submissions(created_at desc);

-- RLS
alter table public.contact_submissions enable row level security;

-- Service role full access (desktop admin app + API)
create policy "Service role full access contact_submissions" on public.contact_submissions
  for all using (true) with check (true);

-- Anonymous can insert (public contact form)
create policy "Anonymous can submit contact form" on public.contact_submissions
  for insert with check (true);
