-- Local Fix — Auth & roles setup (contractors + admin)
-- Paste this whole file into the Supabase SQL Editor and click "Run".
--
-- What it sets up:
--   • a profiles table giving every signed-up user a role (contractor | admin)
--   • a trigger that auto-creates that profile on signup (default role = contractor)
--   • role helper functions used by the security rules
--   • rules so ADMINS can read all submissions + change a job's status
--   • a safe function contractors call to browse jobs WITHOUT homeowner contact info
--
-- Homeowners are NOT part of this — they post with no account, exactly as before.

-- Safety: make sure the status column exists (no-op if you already ran the migration).
alter table public.job_submissions
  add column if not exists status text not null default 'Submitted';

-- ───────────────────────────── profiles + roles ─────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  role       text not null default 'contractor',   -- 'contractor' | 'admin'
  approved   boolean not null default true,         -- set DEFAULT to false to require admin approval
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'contractor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ──────────────────── role helpers (bypass RLS to read role) ─────────────────
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_approved_contractor()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'contractor' and approved
  );
$$;

-- ─────────────────────────────── profiles RLS ───────────────────────────────
drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "admins read all profiles" on public.profiles;
create policy "admins read all profiles" on public.profiles
  for select to authenticated using (public.is_admin());

drop policy if exists "admins update profiles" on public.profiles;
create policy "admins update profiles" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ──────────── job_submissions: admins can read everything + set status ───────
-- (the public/anon INSERT policy from supabase-setup.sql stays exactly as-is)
drop policy if exists "admins read submissions" on public.job_submissions;
create policy "admins read submissions" on public.job_submissions
  for select to authenticated using (public.is_admin());

drop policy if exists "admins update submissions" on public.job_submissions;
create policy "admins update submissions" on public.job_submissions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ───────── contractor jobs feed: SAFE columns only, role-checked ─────────────
-- Contractors call this via supabase.rpc('list_jobs_for_contractor'). It returns
-- the job details WITHOUT name / phone / email, and only to approved contractors
-- (or admins). The contact columns are never selected, so they can't leak.
create or replace function public.list_jobs_for_contractor()
returns table (
  id bigint, created_at timestamptz, category text, description text,
  zip text, urgency text, media text[], status text
)
language sql security definer stable set search_path = public as $$
  select id, created_at, category, description, zip, urgency, media, status
  from public.job_submissions
  where public.is_approved_contractor() or public.is_admin()
  order by created_at desc;
$$;

grant execute on function public.list_jobs_for_contractor() to authenticated;
revoke execute on function public.list_jobs_for_contractor() from anon;

-- ════════════════════════════════════════════════════════════════════════════
-- AFTER running this, make yourself the admin. Sign up once (on contractors.html
-- or in Authentication → Users), then run, with YOUR email:
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
--
-- To require manual approval of contractors instead of auto-approving:
--   alter table public.profiles alter column approved set default false;
--   -- then approve each one with:
--   update public.profiles set approved = true where email = 'them@example.com';
-- ════════════════════════════════════════════════════════════════════════════
