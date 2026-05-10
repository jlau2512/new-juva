# Deploy now — three paths

You have a complete Next.js 14 project. Pick whichever path matches how you like to work.

---

## Path A — Vercel CLI (fastest, ~2 min)

```bash
cd juva-next
npm install
npm i -g vercel
vercel login        # opens a browser to authenticate
vercel --prod       # answers: name = juva, link existing? = no
```

Vercel will install deps, build, and give you a `https://juva-xxxxx.vercel.app` URL.

---

## Path B — GitHub + Vercel git integration (best long-term)

```bash
cd juva-next
git init && git add -A && git commit -m "JUVA — phase 2"
gh repo create juva --public --source=. --push   # or use github.com UI
```

Then on [vercel.com](https://vercel.com): **Add New… → Project → Import** the `juva` repo. Click **Deploy**. Every future `git push` auto-deploys.

---

## Path C — Drag and drop (no terminal)

1. Open [vercel.com](https://vercel.com), sign in.
2. **Add New… → Project**.
3. Drag the `juva-next` folder (or the zip after extraction) into the upload area.
4. Click **Deploy**.

---

## Right after first deploy

1. **Wire up the form** — see `SETUP.md` (15 min) to create the Google Sheet + Apps Script.
2. **Add the env var** in Vercel → Project → Settings → Environment Variables:
   - `NEXT_PUBLIC_FORM_ENDPOINT` = your Apps Script `/exec` URL
   - `NEXT_PUBLIC_SITE_URL` = your final domain (after step 3)
3. **Add your domain** when you buy one — Project → Settings → Domains → Add. Vercel shows the DNS records, propagation is 5–60 min, HTTPS is automatic.

---

## What you have

- 🌗 Dark theme + neon green (#ccff00) — JUVA's signature, levelled up
- 🇬🇧 / 🇫🇷 Full EN/FR i18n with cookie-aware language switcher
- ✨ Framer Motion animations: hero word rotator, magnetic buttons, custom cursor, smooth scroll, scroll reveals, marquee, animated process timeline, accordion FAQ
- 🧭 Multi-step quote wizard (5 steps, progress bar, honeypot anti-spam)
- 💬 Floating WhatsApp button (+230 5968 6136) with pulse animation
- 🪤 Exit-intent popup that captures email for a free 1-page audit
- 🧾 Google Sheet integration (with auto-reply emails to leads + notification to you)
- 🔍 Sitemap, robots.txt, JSON-LD ProfessionalService schema, dynamic OG image
- 📱 Fully responsive, mobile-aware (cursor disables on touch, exit-intent uses visibility instead)

Pages: `/` (home) · `/work` · `/services` · `/contact` — each in EN and FR.
