-- Match the baseline schema and ensure every job has a due time.
UPDATE public.jobs
SET execute_after = NOW()
WHERE execute_after IS NULL;

ALTER TABLE public.jobs
  ALTER COLUMN execute_after SET NOT NULL;
