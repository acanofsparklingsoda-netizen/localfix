# Local Fix — Google Sheets setup (Post My Problem form)

The **Post My Problem** form writes each submission straight into a Google Sheet.
Same method as krushpropertymanagement / burlingtonfurnishedrentals: a Google Cloud
**service account** signs a request and appends a row via the Sheets API. **No Apps
Script.** The form POSTs JSON to `submit-job.php`; `credentials.json` (the
service-account key) sits next to it.

We **reuse the same robot account** you already use on Krush / Burlington, so there
is nothing new to create on Google's side.

> **Status:** already configured and tested. Sheet id
> `1-vFITD1vlGZA-WvOnniFKbUn6v-UnmfXI5LKWIx9DG4` is set in `submit-job.php`, the sheet is
> shared with the robot, and the header row is in place. A live test row was appended and
> then cleared. The remaining step is uploading to a PHP host (see Notes). Steps 1–4 below
> are the general procedure / what to repeat for a different sheet.

## The only steps you must do

1. **Make (or pick) a Google Sheet** for Local Fix leads. Copy its id from the URL:
   `https://docs.google.com/spreadsheets/d/`**`<THIS-IS-THE-ID>`**`/edit`

2. **Share the sheet** with the robot account — **Share → paste → Editor → Send**:
   ```
   lead-updater@zync-herimports-f61c3849.iam.gserviceaccount.com
   ```

3. **Paste the id** into `submit-job.php`:
   ```php
   $spreadsheetId = ''; // <-- PASTE YOUR LOCAL FIX SHEET ID HERE
   ```
   (Leave it blank to skip Sheets logging — the form still submits and shows the popup.)

4. **Put these headers in row 1** of `Sheet1` (the form writes columns in this order):
   ```
   Date | Category | Description | ZIP | Urgency | Name | Phone | Email | Media | Consent | Referer
   ```

That's it. Every submission appends one row.

## Notes

- **Hosting:** `submit-job.php` needs a **PHP host** (e.g. DreamHost). Upload
  `submit-job.php` **and** `credentials.json` to the web root (next to `index.html`).
  GitHub Pages can't run PHP.
- **Photos / videos:** files can't ride along in the JSON POST, so the sheet records the
  **file names** the visitor attached (in the `Media` column), not the files themselves.
  Storing the actual files would need a Google Drive step — not wired up.
- **Anti-bot:** a honeypot field, a "JS ran" token, and a 3-second time gate run before
  anything is logged. (Google reCAPTCHA can be added later, like on Burlington.)
- **Security:** never commit `credentials.json` to a public repo — it's in `.gitignore`.

## Quick checklist
- [x] Share the lead sheet with `lead-updater@zync-herimports-f61c3849.iam.gserviceaccount.com` (Editor)
- [x] Paste the Sheet id into `$spreadsheetId` in `submit-job.php`
- [x] Add the header row to `Sheet1`
- [x] Confirm a test submission lands a row (done locally)
- [ ] Upload `submit-job.php` **and** `credentials.json` to a PHP-capable web root
- [ ] Send yourself a test submission from the live `/post-job.html`
