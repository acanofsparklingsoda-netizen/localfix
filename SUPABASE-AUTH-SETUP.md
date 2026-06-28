# Local Fix — Auth setup (contractors + admin)

This adds **logins** for contractors and admins. Homeowners are untouched — they still
post with no account.

- **Contractors** sign up / log in at **`contractors.html`** and browse jobs **without**
  homeowner contact info (name/phone/email are never sent to them).
- **Admins** log in at **`admin.html`** to see everything + change each job's status.

Both pages use the **anon key** (already in `supabase-config.js`) + Supabase Auth — no
master key anymore, so `admin.html` is now safe to deploy. (The old master-key version is
kept as `admin-servicekey.html`, git-ignored, as a fallback.)

## Steps (~5 min)

### 1. Run the SQL
In Supabase → **SQL Editor → New query**, paste all of **`supabase-auth-setup.sql`** and
**Run**. This creates the `profiles` (roles) table, the signup trigger, the security rules,
and the safe `list_jobs_for_contractor()` function.

### 2. (For testing) turn off email confirmation
**Authentication → Providers → Email →** uncheck **"Confirm email" → Save.** This lets you
sign up and log in instantly while testing. For launch, turn it back on so people verify
their email (the pages already handle the "check your email" case).

### 3. Make yourself the admin
1. Create your account: open **`contractors.html`**, switch to **Sign up**, register with
   your email + password. (Or **Authentication → Users → Add user**.)
2. Promote it — in **SQL Editor**, run with your email:
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Log in at **`admin.html`** with that email + password → you should see all submissions,
   each with a **Status** dropdown you can change.

### 4. Test a contractor
Open `contractors.html` in a different browser (or incognito), sign up with a *different*
email, and you should see the posted jobs — **with no name/phone/email** on them.

## Notes

- **Contractors are auto-approved** right now (they can browse jobs as soon as they sign up).
  They still only ever see the contact-free view, so the risk is low. To require your
  approval instead:
  ```sql
  alter table public.profiles alter column approved set default false;
  -- approve someone later:
  update public.profiles set approved = true where email = 'them@example.com';
  ```
  Unapproved contractors see a "pending approval" message instead of jobs.
- **Why it's safe:** contractors never query the jobs table directly. They call
  `list_jobs_for_contractor()`, which selects only the safe columns (category, description,
  zip, urgency, media, status) and checks the caller's role. The contact columns are never
  selected, so they can't leak — even via the API.
- **Roles:** everyone who signs up is a `contractor` by default; `admin` is only ever set by
  the SQL above. Nobody can make themselves an admin.

## What's next (Phase 2)
An **"I'm interested" button** on each contractor job → notifies you → you connect that
contractor with the homeowner (the controlled moment contact info is shared).
