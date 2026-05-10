# Push to GitHub `jeanlau25/new-juva` → Deploy to Vercel

Step-by-step. About **5 minutes total**. Copy-paste each block into a terminal opened **inside the `juva-next` folder** (the one with `package.json`).

---

## 1 — Create the empty repo on GitHub (30 sec)

1. Go to **https://github.com/new**
2. Owner: `jeanlau25`
3. Repository name: `new-juva`
4. Visibility: **Public**
5. **Do NOT** check "Add a README", "Add .gitignore" or "Choose a license" — leave all three off (the project already has its own files)
6. Click **Create repository**

GitHub will show a "quick setup" page. You can ignore it — the commands below are simpler.

---

## 2 — Push the code (1 min)

Open Terminal, then `cd` into the `juva-next` folder you downloaded, e.g.:

```bash
cd ~/Downloads/juva-next
```

Then run, all in one go:

```bash
git init -b main
git add -A
git commit -m "JUVA — phase 2: Next.js 14, i18n, animations, lead gen"
git remote add origin https://github.com/jeanlau25/new-juva.git
git push -u origin main
```

If git asks for credentials:
- **Username**: `jeanlau25`
- **Password**: paste a Personal Access Token (PAT) — not your real password.
  Get one at **https://github.com/settings/tokens** → "Generate new token (classic)" → tick `repo` scope → generate → copy.

After it pushes, refresh `https://github.com/jeanlau25/new-juva` — you should see all 45 files.

---

## 3 — Deploy to Vercel (2 min)

1. Go to **https://vercel.com/new**
2. Click **Import Git Repository**
3. If GitHub isn't connected yet, click **Install GitHub App** (one-time) and grant access to `new-juva` (or all repos)
4. Find `new-juva` in the list and click **Import**
5. **Project name**: `juva` (or `new-juva`, your call)
6. **Framework**: should auto-detect "Next.js" — leave it
7. **Root directory**: `./` — leave it
8. Skip env vars for now (you'll add them after the form is wired up — see `SETUP.md`)
9. Click **Deploy**

Wait ~60 seconds. Vercel installs deps, builds, and gives you a URL like `https://juva-xxxxx.vercel.app`.

---

## 4 — After it's live

1. **Wire the contact form** → follow `SETUP.md` (15 min). You create a Google Sheet + paste `GOOGLE_APPS_SCRIPT.js` into script.google.com → get a `/exec` URL.

2. **Add 2 env vars** in Vercel → Project → Settings → Environment Variables:
   - `NEXT_PUBLIC_FORM_ENDPOINT` = `https://script.google.com/macros/s/.../exec`
   - `NEXT_PUBLIC_SITE_URL` = `https://your-vercel-url.vercel.app` (replace once you have a custom domain)

   After saving, click **Deployments → ⋯ → Redeploy** so the env vars take effect.

3. **Test a lead**: open `/en/contact`, fill the wizard, hit submit. You should see a row in your Google Sheet, an email at `hello@juva.mu`, and an auto-reply on the test email.

4. **When you buy a domain** (e.g. `juva.mu`):
   - Vercel → Project → Settings → Domains → **Add** → enter the domain
   - Vercel shows the DNS records — set them at your registrar
   - Wait 5–60 min for propagation. HTTPS is automatic.
   - Update `NEXT_PUBLIC_SITE_URL` env var to the new domain, redeploy.

---

## Future updates

Once everything's connected, every `git push` redeploys. Workflow:

```bash
# make changes...
git add -A && git commit -m "fix: tweak hero copy"
git push
```

Vercel picks it up within seconds.

---

## If something breaks

- **`git push` fails with auth error** → your PAT is wrong or expired. Regenerate at github.com/settings/tokens.
- **Vercel build fails** → in the failed deployment, click "View Build Logs". Paste the error to me and I'll fix it.
- **Form submits but no row appears in Sheet** → re-check `SETUP.md` step 3 (the env var must start with `NEXT_PUBLIC_`).
