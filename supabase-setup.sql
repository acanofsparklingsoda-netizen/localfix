-- Local Fix — Supabase setup for the "Post My Problem" form.
-- Paste this whole file into the Supabase SQL Editor and click "Run".
-- It creates the table, the Storage bucket, and the security policies so the
-- public form can submit (insert + upload) but nobody can read submissions
-- except you (via the dashboard / service role).

-- ────────────────────────────────────────────────────────────────────────────
-- 1) Table that holds each job submission
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists public.job_submissions (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  category    text,
  description text,
  zip         text,
  urgency     text,
  name        text,
  phone       text,
  email       text,
  consent     boolean default false,
  media       text[],        -- public URLs of the uploaded photos/videos
  referer     text,
  -- Workflow status the admin moves a job through.
  -- Submitted | Reviewing | Sent to worker | Worker interested | Connected | Completed | Cancelled
  status      text not null default 'Submitted'
);

-- ────────────────────────────────────────────────────────────────────────────
-- 2) Row Level Security: lock the table down, then allow ONLY public inserts
-- ────────────────────────────────────────────────────────────────────────────
alter table public.job_submissions enable row level security;

-- The form always posts anonymously (even if a user is logged in — see script.js),
-- so the anon role is all that needs insert access here.
drop policy if exists "anon can submit jobs" on public.job_submissions;
drop policy if exists "anyone can submit jobs" on public.job_submissions;
create policy "anon can submit jobs"
  on public.job_submissions
  for insert
  to anon
  with check (true);

-- ...but there is NO select/update/delete policy for anon, so no one on the
-- public site can read, change, or delete submissions. You see them in the
-- Supabase dashboard (Table editor), which uses the privileged service role.

-- ────────────────────────────────────────────────────────────────────────────
-- 3) Storage bucket for the photos / videos (public reads, 50 MB per-file cap)
-- ────────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit)
values ('job-media', 'job-media', true, 52428800)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

-- Allow anonymous uploads into that one bucket only (the form uploads anonymously).
drop policy if exists "anon can upload job media" on storage.objects;
drop policy if exists "anyone can upload job media" on storage.objects;
create policy "anon can upload job media"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'job-media');

-- The bucket is public, so the uploaded files are viewable via their public URL
-- (which is what we store in job_submissions.media). Fine for testing. To make
-- files private later: set the bucket's "public" to false and switch the code to
-- signed URLs.
