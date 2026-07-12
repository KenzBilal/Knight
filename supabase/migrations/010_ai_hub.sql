-- AI Hub: Multiple API keys per provider + admin-configurable task routing
-- Keys are Knight's own (system-level), NOT per-org

-- System-level AI keys (multiple per provider)
CREATE TABLE ai_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  label text NOT NULL,
  key_value text NOT NULL,
  is_active boolean DEFAULT true,
  disabled_until timestamptz,
  error_count integer DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ai_keys_provider ON ai_keys(provider, is_active);

-- Task-to-provider mapping (admin configurable)
CREATE TABLE ai_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type text NOT NULL UNIQUE,
  task_label text NOT NULL,
  provider text NOT NULL,
  model text NOT NULL,
  cooldown_minutes integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Seed with current defaults
INSERT INTO ai_config (task_type, task_label, provider, model) VALUES
  ('audit_pitch', 'Audit Pitch Generation', 'cohere', 'command-r-plus-08-2024'),
  ('semantic_extract', 'Semantic Business Extraction', 'openrouter', 'meta-llama/llama-3-8b-instruct:free'),
  ('internal_suggestions', 'Internal Sales Cheat Sheet', 'openrouter', 'nvidia/nemotron-3-ultra-550b-a55b:free'),
  ('reply_classification', 'Reply Intent Classification', 'openrouter', 'meta-llama/llama-3.1-8b-instruct:free'),
  ('reply_draft', 'Reply Draft Generation', 'gemini', 'gemini-2.5-flash'),
  ('telegram_reply', 'Telegram DM Reply', 'openrouter', 'google/gemini-2.5-flash'),
  ('telegram_summary', 'Telegram Lead Summary', 'openrouter', 'meta-llama/llama-3.3-70b-instruct'),
  ('keyword_generate', 'Search Keyword Generation', 'openrouter', 'nvidia/nemotron-3-ultra-550b-a55b:free'),
  ('channel_categorize', 'Channel Categorization', 'openrouter', 'nvidia/nemotron-3-ultra-550b-a55b:free'),
  ('initial_pitch', 'Initial Pitch Drafting', 'openrouter', 'nvidia/nemotron-3-ultra-550b-a55b:free'),
  ('team_summary', 'Team Summary Generation', 'openrouter', 'meta-llama/llama-3.3-70b-instruct');

-- RLS (admin only via service role)
ALTER TABLE ai_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access ai_keys" ON ai_keys FOR ALL USING (true);
CREATE POLICY "Service role full access ai_config" ON ai_config FOR ALL USING (true);
