-- ============================================================
-- PLANS TABLE — Single source of truth for all plan config
-- ============================================================
-- Admin app edits plans here → dashboard billing page reads from here
-- LemonSqueezy variant IDs stored here so checkout works

CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,                          -- 'free', 'starter', 'pro'
  name TEXT NOT NULL,                            -- Display name: 'Free', 'Starter', 'Pro'
  price INTEGER NOT NULL DEFAULT 0,              -- Price in cents (0, 4900, 14900)
  period TEXT NOT NULL DEFAULT 'month',          -- 'month', 'year', 'once'
  description TEXT,                              -- Short tagline
  features TEXT[] NOT NULL DEFAULT '{}',          -- Array of feature strings
  lead_limit INTEGER NOT NULL DEFAULT 0,         -- -1 = unlimited
  email_limit INTEGER NOT NULL DEFAULT 0,        -- -1 = unlimited
  telegram_limit INTEGER NOT NULL DEFAULT 0,     -- -1 = unlimited
  lemon_product_id TEXT,                         -- LemonSqueezy product ID
  lemon_variant_id TEXT,                         -- LemonSqueezy variant ID for checkout
  sort_order INTEGER NOT NULL DEFAULT 0,         -- Display order on billing page
  highlighted BOOLEAN NOT NULL DEFAULT FALSE,    -- Show as recommended
  active BOOLEAN NOT NULL DEFAULT TRUE,          -- Visible on billing page
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed with current plans (fill in your LemonSqueezy variant IDs after)
INSERT INTO plans (id, name, price, period, description, features, lead_limit, email_limit, telegram_limit, sort_order, highlighted, active)
VALUES
  ('free', 'Free', 0, 'forever', 'Try Knight with no commitment',
   ARRAY['50 leads/month','50 emails/month','Basic audit','Dashboard access'],
   50, 50, 0, 0, FALSE, TRUE),
  ('starter', 'Starter', 4900, 'month', 'For solo sales teams',
   ARRAY['Unlimited leads','Unlimited emails','Full audit','AI pitch drafts','CRM pipeline','Email templates'],
   -1, -1, 0, 1, FALSE, TRUE),
  ('pro', 'Pro', 14900, 'month', 'For teams that want the full machine',
   ARRAY['Everything in Starter','Telegram sales agent','Drip sequences','Smart inbox','Custom domain','Bring Your Own Key'],
   -1, -1, -1, 2, TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  features = EXCLUDED.features,
  lead_limit = EXCLUDED.lead_limit,
  email_limit = EXCLUDED.email_limit,
  telegram_limit = EXCLUDED.telegram_limit,
  highlighted = EXCLUDED.highlighted,
  active = EXCLUDED.active,
  updated_at = now();

-- RLS — only service role can access (admin app uses service key)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON plans FOR ALL USING (true) WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS plans_updated_at ON plans;
CREATE TRIGGER plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_plans_updated_at();
