# JUVA — Setup Guide

Two things to wire up after deployment: **the Google Sheet** (your free CRM) and **the Vercel domain**. Total time: ~20 minutes.

---

## Part 1 — Google Sheet + Apps Script (15 min)

### 1. Create the sheet
1. Go to [sheets.google.com](https://sheets.google.com) → blank spreadsheet.
2. Rename it **JUVA Leads**.
3. Copy the **Sheet ID** from the URL — it's the long string between `/d/` and `/edit`:
   ```
   https://docs.google.com/spreadsheets/d/THIS_PART_HERE/edit
   ```

### 2. Deploy the Apps Script
1. Go to [script.google.com](https://script.google.com) → **New project**.
2. Name it **JUVA Lead Capture**.
3. Delete the default code, paste the entire contents of `GOOGLE_APPS_SCRIPT.js` from this repo.
4. On line 28 replace `YOUR_GOOGLE_SHEET_ID_HERE` with your Sheet ID.
5. On line 29 confirm `hello@juva.mu` (or change to your inbox).
6. Save (Ctrl/Cmd + S).
7. Click **Deploy → New deployment**.
8. Click the gear icon → **Web app**.
9. Set **Execute as: Me** and **Who has access: Anyone**.
10. Click **Deploy**, authorize when prompted (Advanced → Go to JUVA Lead Capture → Allow).
11. Copy the **Web App URL** (ends in `/exec`).

### 3. Connect to the website
You have two options.

**A. (recommended) Vercel env var** — works without any code change:
- In Vercel: **Project → Settings → Environment Variables**.
- Add: `NEXT_PUBLIC_FORM_ENDPOINT` = `https://script.google.com/macros/s/.../exec`.
- Redeploy.

**B. Hard-coded** — open `lib/config.ts`, replace the `formEndpoint` placeholder, commit.

### 4. Test it
1. Open `https://your-vercel-url/en/contact`.
2. Fill the wizard with a test submission.
3. Check:
   - ✅ Your "JUVA Leads" sheet has a new row.
   - ✅ You got an email at `hello@juva.mu`.
   - ✅ The test email got an auto-reply.
   - ✅ The success screen appears.

### 5. Use it as a CRM
Update the **Status** column manually:
- `New` → just came in
- `Contacted` → you've replied
- `Quote Sent` → proposal sent
- `Won` / `Lost`

Sort/filter by Status to run your week. That's the whole CRM. Free, forever.

---

## Part 2 — Vercel deployment (5 min)

If you used `vercel --prod` from the CLI, you're already live on a `*.vercel.app` URL.

### When you buy a domain
1. Buy at namecheap.com, godaddy.com, or any registrar.
2. In Vercel: **Project → Settings → Domains** → **Add**.
3. Vercel shows you the DNS records to set at your registrar.
4. Wait for propagation (5–60 min). HTTPS is automatic.
5. In Vercel env: update `NEXT_PUBLIC_SITE_URL` to `https://your-new-domain.com` and redeploy. This updates the sitemap, OG tags, and JSON-LD.

### Recommended domains for Mauritius
- `juva.mu` (primary, .mu builds local trust)
- `juva.com` (international)

---

## Troubleshooting

**Form fails / shows error banner**
- Re-deploy the Apps Script after any code change (a new "version" is required each time).
- Make sure the deployment is set to **Anyone** access.
- Check the env var is `NEXT_PUBLIC_FORM_ENDPOINT` exactly (the prefix matters).

**No emails arrive**
- Check spam.
- In Apps Script → **Executions** tab, look for errors.
- Confirm `NOTIFY_EMAIL` is correct in `GOOGLE_APPS_SCRIPT.js`.

**Sheet ID not working**
- Copy only the part **between** `/d/` and `/edit`.
- The sheet must be in **your** Drive (not someone else's shared with you).
