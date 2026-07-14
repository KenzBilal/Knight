-- ============================================================
-- KNIGHT — Production Hardening Migration
-- Run this in the Supabase SQL editor after the initial schema.
-- ============================================================

-- ── Jobs table: add retry tracking + timing columns ──────────────────────────
alter table public.jobs
  add column if not exists attempts integer not null default 0,
  add column if not exists max_attempts integer not null default 3,
  add column if not exists error text,
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz;

-- Update existing failed jobs to FAILED_PERMANENTLY if they've exceeded max attempts
update public.jobs
  set status = 'FAILED_PERMANENTLY'
  where status = 'FAILED' and attempts >= 3;

-- ── Jobs index: status filter for worker polling ──────────────────────────────
create index if not exists jobs_status_created_idx
  on public.jobs(status, created_at);

-- ── Drip leads index: faster cron query ──────────────────────────────────────
create index if not exists telegram_leads_status_updated_idx
  on public.telegram_leads(status, updated_at);

-- ── Notes ─────────────────────────────────────────────────────────────────────
-- audit_results does NOT have an org_id column (lookup via audit→company→org).
-- drafts does NOT have an org_id column (lookup via email→company→org).
-- Do NOT add org_id to these tables — the worker bug has been fixed in code.
