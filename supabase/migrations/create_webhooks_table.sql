-- Webhooks table for outbound integrations
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'My Webhook',
  events TEXT[] NOT NULL DEFAULT ARRAY['audit.completed'],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  secret TEXT,
  last_triggered_at TIMESTAMPTZ,
  last_status INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_read_webhooks" ON webhooks
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "org_members_manage_webhooks" ON webhooks
  FOR ALL USING (org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  ));

-- MCP API keys table
CREATE TABLE IF NOT EXISTS mcp_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  key_value TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Default',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mcp_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_read_mcp_keys" ON mcp_api_keys
  FOR SELECT USING (org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "org_members_manage_mcp_keys" ON mcp_api_keys
  FOR ALL USING (org_id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  ));
