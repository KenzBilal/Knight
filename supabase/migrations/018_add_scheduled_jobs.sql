-- Add execute_after for delayed scheduling (e.g. drip campaigns)
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS execute_after TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index to optimize polling for due jobs
CREATE INDEX IF NOT EXISTS idx_jobs_execute_after 
ON public.jobs (status, execute_after) 
WHERE status = 'PENDING';
