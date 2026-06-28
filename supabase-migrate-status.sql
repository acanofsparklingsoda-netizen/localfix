-- Migration: add the job "status" column to an EXISTING job_submissions table.
-- Run this once in the Supabase SQL Editor if you set the table up before the
-- status field existed. (Fresh setups already include it via supabase-setup.sql.)
--
-- Adding the column with a default backfills every existing row to 'Submitted'.

alter table public.job_submissions
  add column if not exists status text not null default 'Submitted';

-- Status values the admin moves a job through:
--   Submitted | Reviewing | Sent to worker | Worker interested | Connected | Completed | Cancelled
