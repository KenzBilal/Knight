-- Migration 008: Fix schema mismatches
-- Adds missing columns that API routes expect

-- 1. Add org_id to emails (routes filter/insert by org_id)
ALTER TABLE emails ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES orgs(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_emails_org ON emails(org_id);

-- 2. Add org_id to audit_results (routes insert with org_id)
ALTER TABLE audit_results ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES orgs(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_audit_results_org ON audit_results(org_id);

-- 3. Add name columns to contacts (routes select first_name, last_name, full_name)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS role text;

-- 4. Backfill full_name from existing data if any
UPDATE contacts SET full_name = COALESCE(first_name || ' ' || last_name, email) WHERE full_name IS NULL;

-- 5. Add ai_pitch to companies if missing (worker writes to it)
ALTER TABLE companies ADD COLUMN IF NOT EXISTS ai_pitch text;

-- 6. Add status column to companies if missing
ALTER TABLE companies ADD COLUMN IF NOT EXISTS status text DEFAULT 'NEW';

-- 7. Add updated_at to companies if missing
ALTER TABLE companies ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
