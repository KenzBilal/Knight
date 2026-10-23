-- Persist whether an organization has received the Telegram welcome message.
ALTER TABLE public.org_config
  ADD COLUMN IF NOT EXISTS telegram_welcome_sent boolean DEFAULT false;

UPDATE public.org_config
SET telegram_welcome_sent = false
WHERE telegram_welcome_sent IS NULL;

ALTER TABLE public.org_config
  ALTER COLUMN telegram_welcome_sent SET DEFAULT false,
  ALTER COLUMN telegram_welcome_sent SET NOT NULL;
