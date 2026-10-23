-- Outbound webhooks and organization-scoped MCP credentials.
CREATE TABLE IF NOT EXISTS public.webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  url text NOT NULL,
  label text NOT NULL DEFAULT 'My Webhook',
  events text[] NOT NULL DEFAULT ARRAY['audit.completed'],
  is_active boolean NOT NULL DEFAULT true,
  secret text,
  last_triggered_at timestamptz,
  last_status integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS webhooks_org_idx ON public.webhooks(org_id);

CREATE TABLE IF NOT EXISTS public.mcp_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  key_value text NOT NULL,
  label text NOT NULL DEFAULT 'Default',
  is_active boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mcp_api_keys_org_idx ON public.mcp_api_keys(org_id);
CREATE UNIQUE INDEX IF NOT EXISTS mcp_api_keys_key_value_uidx
  ON public.mcp_api_keys(key_value);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_api_keys ENABLE ROW LEVEL SECURITY;

-- These tables contain signing/API credentials. Access is server-side only.
DROP POLICY IF EXISTS org_members_read_webhooks ON public.webhooks;
DROP POLICY IF EXISTS org_members_manage_webhooks ON public.webhooks;
DROP POLICY IF EXISTS org_members_read_mcp_keys ON public.mcp_api_keys;
DROP POLICY IF EXISTS org_members_manage_mcp_keys ON public.mcp_api_keys;
REVOKE ALL ON public.webhooks, public.mcp_api_keys FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhooks, public.mcp_api_keys TO service_role;

NOTIFY pgrst, 'reload schema';
