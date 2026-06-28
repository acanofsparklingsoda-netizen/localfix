# Local Fix — website

Static marketing site for Local Fix (homeowners post small home-repair jobs; local
workers respond). Plain HTML/CSS/JS — no build step, no server required.

## Pages
- `index.html` — home
- `post-job.html` — "Post My Problem" job form
- `for-workers.html` — worker info + signup
- `about.html` — about
- `contact.html` — contact

## Deploy to GitHub Pages
1. Create a new GitHub repository.
2. Push the **contents of this folder** to the repo root (so `index.html` is at the top level).
3. In the repo: **Settings → Pages → Build and deployment → Source: "Deploy from a branch"**,
   pick your branch (e.g. `main`) and folder `/ (root)`, then **Save**.
4. Wait ~1 minute; your site is live at `https://<username>.github.io/<repo>/`.

`.nojekyll` is included so GitHub serves the files as-is (no Jekyll processing).

## Forms

The **Post My Problem** form (`post-job.html`) sends each submission to **Supabase**:
uploaded photos/videos go to **Supabase Storage**, the form fields go to a Postgres table
(`job_submissions`) with the file URLs, then the page shows a confirmation popup. It runs
from the browser via `supabase-js` — **no server needed**, so it works on GitHub Pages.
See **SUPABASE-SETUP.md** for the one-time setup (create a free project, run
`supabase-setup.sql`, paste your URL + anon key into `supabase-config.js`).

The contact / worker forms still just show an inline success message and don't send data
anywhere yet — they can be wired to Supabase the same way later.

> **Older Google Sheets path (unused):** `submit-job.php` + `credentials.json` +
> `SHEETS-SETUP.md` implement an alternate Google Sheets integration (PHP service account).
> The form no longer uses it, but it's kept in the repo in case you want a Sheet too.
> `credentials.json` is git-ignored — never commit it to a public repo.
