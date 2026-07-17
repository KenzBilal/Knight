-- Add telegram_welcome_sent column to org_config
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/urysguwrouwjqcqcmzxv/sql

ALTER TABLE org_config ADD COLUMN IF NOT EXISTS telegram_welcome_sent BOOLEAN DEFAULT FALSE;

-- Verify
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'org_config' AND column_name = 'telegram_welcome_sent';
