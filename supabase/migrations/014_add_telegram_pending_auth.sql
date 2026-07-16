-- Migration: Add Telegram pending auth columns
-- These store the phone + code hash during the 2FA flow

ALTER TABLE org_config
ADD COLUMN IF NOT EXISTS telegram_pending_phone TEXT,
ADD COLUMN IF NOT EXISTS telegram_pending_code_hash TEXT;
