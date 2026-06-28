# Deploy the Next site to GitHub Pages

This repo has two versions of the site:

- root HTML files such as `index.html`, `signup.html`, and `contractors.html`
- the redesigned Next app in `localfix-next/`

The GitHub Actions workflow in `.github/workflows/deploy-next-pages.yml` builds and deploys the Next app, so GitHub Pages shows the redesigned version instead of the root static HTML files.

## One-time GitHub setup

1. Push this repo to GitHub.
2. In the GitHub repo, open **Settings > Pages**.
3. Set **Source** to **GitHub Actions**.
4. Add the Supabase values in **Settings > Secrets and variables > Actions**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These can be repository secrets or repository variables. They are the public Supabase values used by the browser app.

## What happens on deploy

On every push to `main` or `master`, the workflow:

1. installs dependencies in `localfix-next/`
2. builds the Next app as a static export
3. applies the correct GitHub Pages base path
4. uploads `localfix-next/out` to GitHub Pages

If the repo is named `username.github.io`, the workflow deploys at the domain root. Otherwise it deploys under `/<repo-name>/`, which is how normal GitHub Pages project sites work.

If you later use a custom domain for a normal project repo, add this repository variable:

- `NEXT_PUBLIC_USE_ROOT_PATH` = `true`

That tells the workflow to build links and assets for the domain root instead of `/<repo-name>/`.

## Supabase requirements

The live site still needs the Supabase database setup:

- `supabase-setup.sql`
- `supabase-auth-setup.sql`

With those SQL files run, the deployed site can create worker accounts, create profile rows, log users in, show jobs on the worker board, and let admins access `/admin`.
