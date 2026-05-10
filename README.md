# JUVA — Premium Digital Studio (Next.js 14)

A bilingual (EN / FR), animated, lead-generation marketing site for JUVA Digital Studio.

## Stack

- **Next.js 14** (App Router, RSC, edge OG image)
- **TypeScript** + **Tailwind CSS**
- **Framer Motion** for animation choreography
- **Lenis** smooth scroll
- Custom magnetic cursor + magnetic buttons
- **Google Apps Script** → Google Sheet for lead capture (zero-cost CRM)

## Structure

```
app/
  [locale]/                # /en, /fr (i18n via middleware)
    page.tsx               # home
    contact/page.tsx       # multi-step quote wizard
    services/page.tsx
    work/page.tsx
    layout.tsx             # locale layout with cursor, smooth scroll, header, footer, exit-intent, WhatsApp
  layout.tsx               # root (fonts, metadata)
  opengraph-image.tsx      # dynamic OG image
  sitemap.ts / robots.ts   # SEO
components/                # UI building blocks
lib/
  i18n.ts                  # locale registry
  config.ts                # site constants (email, phone, form endpoint)
  dictionaries/            # en.ts, fr.ts copy
GOOGLE_APPS_SCRIPT.js      # paste into script.google.com
SETUP.md                   # 15-min Google Sheet wiring
```

## Local dev

```bash
npm install
npm run dev          # http://localhost:3000 → redirects to /en
```

## Lead capture

The contact form posts JSON to a Google Apps Script Web App that writes a row to your Sheet, emails you, and sends the prospect an auto-reply.

1. Follow `SETUP.md` (15 minutes).
2. Set the Web App URL as the `NEXT_PUBLIC_FORM_ENDPOINT` env var in Vercel **and** locally:

```bash
echo 'NEXT_PUBLIC_FORM_ENDPOINT=https://script.google.com/macros/s/.../exec' > .env.local
```

## Deploying to Vercel

```bash
npm i -g vercel
vercel --prod
```

Or import the repo in vercel.com — zero config required (Next.js is auto-detected).

After buying a domain, add it in **Vercel → Project → Settings → Domains** and update DNS as instructed. Then update `lib/config.ts` `SITE.url` (or set `NEXT_PUBLIC_SITE_URL` in Vercel env).

## Customization checklist

- `lib/config.ts` — email, phone, WhatsApp, founded year
- `lib/dictionaries/en.ts` and `fr.ts` — copy in both languages
- `components/sections/Work.tsx` — work tiles use copy from dict; swap for real screenshots later
- `app/opengraph-image.tsx` — social share card

## License

© JUVA Digital Studio. All rights reserved.
