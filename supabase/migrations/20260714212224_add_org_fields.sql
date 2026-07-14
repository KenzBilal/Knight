ALTER TABLE public.audits ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.orgs(id) ON DELETE CASCADE;
UPDATE public.audits SET org_id = companies.org_id FROM public.companies WHERE audits.company_id = companies.id AND audits.org_id IS NULL;
ALTER TABLE public.audits ALTER COLUMN org_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS audits_org_idx ON public.audits(org_id);

ALTER TABLE public.org_members ADD COLUMN IF NOT EXISTS joined_at timestamptz DEFAULT now();
UPDATE public.org_members SET joined_at = now() WHERE joined_at IS NULL;

ALTER TABLE public.org_config ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
UPDATE public.org_config SET updated_at = now() WHERE updated_at IS NULL;
