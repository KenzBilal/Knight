-- Monthly, organization-scoped quota counters used by the dashboard and worker.
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  leads_searched integer NOT NULL DEFAULT 0 CHECK (leads_searched >= 0),
  emails_sent integer NOT NULL DEFAULT 0 CHECK (emails_sent >= 0),
  audits_run integer NOT NULL DEFAULT 0 CHECK (audits_run >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, period_start)
);

-- Upgrade an older deployment of the table without dropping its existing data.
ALTER TABLE public.usage_tracking
  ADD COLUMN IF NOT EXISTS period_end date,
  ADD COLUMN IF NOT EXISTS leads_searched integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS emails_sent integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS audits_run integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

UPDATE public.usage_tracking
SET period_end = (date_trunc('month', period_start) + interval '1 month - 1 day')::date
WHERE period_end IS NULL;

ALTER TABLE public.usage_tracking
  ALTER COLUMN period_end SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS usage_tracking_org_period_uidx
  ON public.usage_tracking (org_id, period_start);
CREATE INDEX IF NOT EXISTS usage_tracking_org_idx
  ON public.usage_tracking (org_id);

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS usage_tracking_select_own ON public.usage_tracking;
CREATE POLICY usage_tracking_select_own ON public.usage_tracking
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_members.org_id = usage_tracking.org_id
        AND org_members.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION public.increment_usage(p_org_id uuid, p_action text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_period_start date := date_trunc('month', now() AT TIME ZONE 'UTC')::date;
  v_period_end date := (date_trunc('month', now() AT TIME ZONE 'UTC') + interval '1 month - 1 day')::date;
BEGIN
  IF p_action IS NULL OR p_action NOT IN ('lead', 'email') THEN
    RAISE EXCEPTION 'Unsupported usage action: %', p_action USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.usage_tracking (org_id, period_start, period_end, leads_searched, emails_sent)
  VALUES (p_org_id, v_period_start, v_period_end,
          CASE WHEN p_action = 'lead' THEN 1 ELSE 0 END,
          CASE WHEN p_action = 'email' THEN 1 ELSE 0 END)
  ON CONFLICT (org_id, period_start) DO UPDATE SET
    leads_searched = public.usage_tracking.leads_searched + EXCLUDED.leads_searched,
    emails_sent = public.usage_tracking.emails_sent + EXCLUDED.emails_sent,
    period_end = EXCLUDED.period_end;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_usage(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_usage(uuid, text) TO service_role;

CREATE OR REPLACE FUNCTION public.reset_usage(p_org_id uuid, p_action text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_period_start date := date_trunc('month', now() AT TIME ZONE 'UTC')::date;
  v_period_end date := (date_trunc('month', now() AT TIME ZONE 'UTC') + interval '1 month - 1 day')::date;
BEGIN
  IF p_action IS NULL OR p_action NOT IN ('leads', 'emails', 'all') THEN
    RAISE EXCEPTION 'Unsupported usage reset action: %', p_action USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.usage_tracking (org_id, period_start, period_end)
  VALUES (p_org_id, v_period_start, v_period_end)
  ON CONFLICT (org_id, period_start) DO UPDATE SET
    leads_searched = CASE WHEN p_action IN ('leads', 'all') THEN 0
                          ELSE public.usage_tracking.leads_searched END,
    emails_sent = CASE WHEN p_action IN ('emails', 'all') THEN 0
                       ELSE public.usage_tracking.emails_sent END,
    period_end = EXCLUDED.period_end;
END;
$$;

REVOKE ALL ON FUNCTION public.reset_usage(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_usage(uuid, text) TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.usage_tracking TO service_role;

NOTIFY pgrst, 'reload schema';
