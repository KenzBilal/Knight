-- Support Tickets System
-- Migration 011: support_tickets + support_replies

-- Support tickets
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  status text not null default 'open' check (status in ('open', 'in-progress', 'resolved', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  category text not null default 'other' check (category in ('bug', 'feature', 'billing', 'other')),
  last_seen_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Support replies (message thread)
create table if not exists public.support_replies (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_type text not null check (sender_type in ('user', 'admin')),
  sender_id uuid not null,
  message text not null,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_support_tickets_user on public.support_tickets(user_id);
create index if not exists idx_support_tickets_org on public.support_tickets(org_id);
create index if not exists idx_support_tickets_status on public.support_tickets(status);
create index if not exists idx_support_replies_ticket on public.support_replies(ticket_id);

-- RLS policies
alter table public.support_tickets enable row level security;
alter table public.support_replies enable row level security;

-- Users can view their own tickets
create policy "Users view own tickets" on public.support_tickets
  for select using (auth.uid() = user_id);

-- Users can create tickets
create policy "Users create tickets" on public.support_tickets
  for insert with check (auth.uid() = user_id);

-- Users can update their own tickets (for last_seen_at)
create policy "Users update own tickets" on public.support_tickets
  for update using (auth.uid() = user_id);

-- Users can view replies on their own tickets
create policy "Users view replies on own tickets" on public.support_replies
  for select using (
    exists (
      select 1 from public.support_tickets
      where support_tickets.id = support_replies.ticket_id
      and support_tickets.user_id = auth.uid()
    )
  );

-- Users can create replies on their own tickets
create policy "Users create replies on own tickets" on public.support_replies
  for insert with check (
    exists (
      select 1 from public.support_tickets
      where support_tickets.id = support_replies.ticket_id
      and support_tickets.user_id = auth.uid()
    )
  );

-- Service role can do everything (for admin desktop app)
create policy "Service role full access tickets" on public.support_tickets
  for all using (true) with check (true);

create policy "Service role full access replies" on public.support_replies
  for all using (true) with check (true);
