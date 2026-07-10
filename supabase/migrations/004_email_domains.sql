-- Email domains table
CREATE TABLE IF NOT EXISTS public.email_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
  dkim_record TEXT,
  spf_record TEXT,
  dmarc_record TEXT,
  verification_token TEXT,
  resend_domain_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, domain)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS email_domains_org_idx ON public.email_domains(org_id);

-- RLS policies
ALTER TABLE public.email_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_domains_all_own" ON public.email_domains
  FOR ALL USING (
    org_id IN (
      SELECT org_members.org_id
      FROM public.org_members
      WHERE org_members.user_id = auth.uid()
    )
  );
