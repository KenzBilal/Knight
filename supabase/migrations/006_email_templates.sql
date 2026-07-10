-- Email templates table
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('initial', 'follow_up_1', 'follow_up_2', 're_engagement', 'reply')),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for org lookups
CREATE INDEX idx_email_templates_org_id ON email_templates(org_id);

-- Unique constraint for default templates per org per type
CREATE UNIQUE INDEX idx_email_templates_default ON email_templates(org_id, type) WHERE is_default = TRUE;

-- RLS policies
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's templates"
  ON email_templates FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert templates for their org"
  ON email_templates FOR INSERT
  WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their org's templates"
  ON email_templates FOR UPDATE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their org's templates"
  ON email_templates FOR DELETE
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Insert default templates for existing orgs
DO $$
DECLARE
  org_record RECORD;
BEGIN
  FOR org_record IN SELECT id FROM orgs LOOP
    -- Initial cold outreach
    INSERT INTO email_templates (org_id, name, type, subject, body, is_default) VALUES
    (org_record.id, 'Cold Outreach', 'initial', 
     'Quick question about {{company_name}}''s website',
     'Hi {{contact_name}},

I came across {{company_name}} while researching {{industry}} businesses, and I noticed a few things on your website that might be costing you customers.

We work with businesses like yours to fix conversion-killing issues — things like slow load times, confusing navigation, or mobile experiences that don''t quite work.

I''d love to show you exactly what we found. Would you be open to a quick 10-minute call this week?

Best,
{{sender_name}} Team',
     TRUE);

    -- Follow-up 1 (3 days)
    INSERT INTO email_templates (org_id, name, type, subject, body, is_default) VALUES
    (org_record.id, 'Follow-up #1', 'follow_up_1',
     'Re: Quick question about {{company_name}}''s website',
     'Hi {{contact_name}},

Just wanted to follow up on my last email. I know things get busy.

We recently helped a similar {{industry}} business increase their leads by 40% just by fixing a few website issues. I''d love to show you what we found for {{company_name}}.

Would a quick call work for you this week?

Best,
{{sender_name}} Team',
     TRUE);

    -- Follow-up 2 (7 days)
    INSERT INTO email_templates (org_id, name, type, subject, body, is_default) VALUES
    (org_record.id, 'Follow-up #2', 'follow_up_2',
     'Last thought on {{company_name}}',
     'Hi {{contact_name}},

I don''t want to be a pest, so this will be my last email.

If you''re interested in seeing how we can help {{company_name}} get more customers from your website, just reply to this email and I''ll set up a quick call.

No hard feelings if now isn''t the right time.

Best,
{{sender_name}} Team',
     TRUE);

    -- Re-engagement
    INSERT INTO email_templates (org_id, name, type, subject, body, is_default) VALUES
    (org_record.id, 'Re-engagement', 're_engagement',
     'Still need help with {{company_name}}''s website?',
     'Hi {{contact_name}},

It''s been a while since we last connected. I wanted to reach out because we''ve been helping businesses in the {{industry}} space improve their online presence and get more customers.

If you''re still looking to grow {{company_name}}, I''d love to chat. We''ve got some new strategies that could work well for your business.

Would you be open to a quick catch-up?

Best,
{{sender_name}} Team',
     TRUE);

    -- Reply to interested leads
    INSERT INTO email_templates (org_id, name, type, subject, body, is_default) VALUES
    (org_record.id, 'Interested Reply', 'reply',
     'Re: {{subject}}',
     'Hi {{contact_name}},

Thanks for getting back to! I''m glad you''re interested.

I''d love to show you exactly what we found for {{company_name}}. It''ll only take about 10 minutes.

You can book a time here: {{calendly_link}}

Looking forward to chatting!

Best,
{{sender_name}} Team',
     TRUE);
  END LOOP;
END $$;
