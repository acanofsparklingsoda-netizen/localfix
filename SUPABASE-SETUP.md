# Local Fix — Supabase setup (Post My Problem form)

The Post My Problem form sends each submission to **Supabase**: the photos/videos go
into **Supabase Storage**, the form fields go into a **Postgres table** (with the file
URLs). It runs entirely from the browser via `supabase-js`, so **no PHP host is needed**
— this works on GitHub Pages.

## One-time setup (≈5 minutes)

### 1. Create a free Supabase project
1. Go to <https://supabase.com> → **Sign in** (GitHub login is easiest) → **New project**.
2. Pick an **organization** (the free plan is fine), give the project a **name**
   (e.g. `localfix`), set a **database password** (save it somewhere — you won't need it
   for this, but Supabase requires one), and choose the **region** closest to you.
3. Click **Create new project** and wait ~2 minutes while it provisions.

### 2. Run the setup SQL
1. In the project, open **SQL Editor** (left sidebar) → **New query**.
2. Open `supabase-setup.sql` from this repo, copy **all** of it, paste it in, click **Run**.
   You should see "Success. No rows returned." This creates the `job_submissions` table,
   the `job-media` Storage bucket, and the security policies for anonymous legacy posts
   plus signed-in homeowner posts.

### 3. Copy your two keys into the site
1. Go to **Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. Paste them into `supabase-config.js`:
   ```js
   window.SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
   window.SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
   ```
   (Or just send me both and I'll drop them in.)

That's it. Submit a test from the **Post My Problem** page and watch the row appear in
**Table editor → job_submissions**, with the uploaded files in **Storage → job-media**.

## Good to know
- **The anon key is public on purpose.** Unlike the Google service-account key, it's
  designed to live in client-side code. Security comes from the Row Level Security
  policies in the SQL (the public form can *insert* a submission and *upload* a file,
  signed-in users can do the same with their account attached, but visitors cannot
  *read* anyone's submissions). So the anon key is safe to commit.
- **Where leads live now:** in the Supabase dashboard (Table editor), not a Google Sheet.
  The old `submit-job.php` + `credentials.json` (Google Sheets) are still in the repo but
  are no longer used by the form. Say the word if you want both.
- **Free tier limits (for testing):** ~1 GB Storage and limited egress. Per-file cap is set
  to 50 MB in the SQL. Plenty for testing; videos are what eat the quota, so keep them short.
- **Privacy:** the `job-media` bucket is **public** (uploaded files are viewable by anyone
  with the URL) for simplicity while testing. To lock it down later, set the bucket to
  private and switch to signed URLs — I can do that when you're ready.
- **Anti-bot:** the form keeps a honeypot field + a 3-second time gate (client-side). For
  production you may want a captcha or a Supabase Edge Function; client checks alone are
  weaker than the old server-side PHP checks.
