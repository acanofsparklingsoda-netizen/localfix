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

## Note on forms
The contact / Post My Problem / worker forms currently show a success message in the
browser but **do not send the data anywhere** — GitHub Pages cannot run server-side code
(no PHP). To actually receive submissions, point each form at a static-friendly form
service (e.g. Web3Forms, Formspree, or FormSubmit). Not wired up yet.
