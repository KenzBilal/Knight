-- Store the inline button message ID used by Telegram lead controls.
ALTER TABLE public.telegram_leads
  ADD COLUMN IF NOT EXISTS admin_msg_id bigint;
