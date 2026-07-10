-- Add telegram_mode and telegram_phone to org_config
-- telegram_mode: 'userbot' or 'normal' or null (not connected)
-- telegram_phone: phone number for userbot connection

alter table public.org_config 
  add column if not exists telegram_mode text,
  add column if not exists telegram_phone text;
