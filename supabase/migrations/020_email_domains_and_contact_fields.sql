-- Provision the custom sender-domain table used by the dashboard.
CREATE TABLE IF NOT EXISTS public.email_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  domain text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
  verification_token text,
  dkim_record text,
  spf_record text,
  dmarc_record text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, domain)
);

CREATE INDEX IF NOT EXISTS email_domains_org_idx ON public.email_domains(org_id);
ALTER TABLE public.email_domains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS email_domains_all_own ON public.email_domains;
CREATE POLICY email_domains_all_own ON public.email_domains
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_members.org_id = email_domains.org_id
        AND org_members.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_members.org_id = email_domains.org_id
        AND org_members.user_id = auth.uid()
    )
  );

ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_domains TO service_role;

NOTIFY pgrst, 'reload schema';
