-- Migration: Add org_id to contacts table
-- This allows contacts to be properly scoped to organizations

ALTER TABLE public.contacts ADD COLUMN org_id UUID;

-- Update existing contacts to have org_id from their parent company
UPDATE public.contacts 
SET org_id = companies.org_id 
FROM public.companies 
WHERE contacts.company_id = companies.id;

-- Make org_id NOT NULL after backfill
ALTER TABLE public.contacts ALTER COLUMN org_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE public.contacts 
ADD CONSTRAINT contacts_org_id_fkey 
FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE CASCADE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS contacts_org_idx ON public.contacts(org_id);

-- Update RLS policy to use org_id
DROP POLICY IF EXISTS contacts_select_own ON public.contacts;

CREATE POLICY contacts_select_own ON public.contacts
  FOR SELECT USING (
    org_id IN (
      SELECT org_members.org_id 
      FROM public.org_members 
      WHERE org_members.user_id = auth.uid()
    )
  );
