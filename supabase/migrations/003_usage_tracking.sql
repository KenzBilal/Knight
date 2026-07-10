-- Usage tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  period_start DATE NOT NULL DEFAULT DATE_TRUNC('month', NOW()),
  leads_searched INT DEFAULT 0,
  emails_sent INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, period_start)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS usage_tracking_org_period_idx ON public.usage_tracking(org_id, period_start);

-- RLS policies
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_tracking_select_own" ON public.usage_tracking
  FOR SELECT USING (
    org_id IN (
      SELECT org_members.org_id
      FROM public.org_members
      WHERE org_members.user_id = auth.uid()
    )
  );

-- Function to increment usage
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_org_id UUID,
  p_action TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.usage_tracking (org_id, period_start, leads_searched, emails_sent)
  VALUES (
    p_org_id,
    DATE_TRUNC('month', NOW()),
    CASE WHEN p_action = 'lead' THEN 1 ELSE 0 END,
    CASE WHEN p_action = 'email' THEN 1 ELSE 0 END
  )
  ON CONFLICT (org_id, period_start)
  DO UPDATE SET
    leads_searched = usage_tracking.leads_searched + CASE WHEN p_action = 'lead' THEN 1 ELSE 0 END,
    emails_sent = usage_tracking.emails_sent + CASE WHEN p_action = 'email' THEN 1 ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
