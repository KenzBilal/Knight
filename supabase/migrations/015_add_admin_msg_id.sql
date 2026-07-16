-- Add admin_msg_id column to telegram_leads for storing the inline button message ID
ALTER TABLE telegram_leads ADD COLUMN IF NOT EXISTS admin_msg_id bigint;
