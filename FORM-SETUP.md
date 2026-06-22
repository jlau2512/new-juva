# JUVA Contact Form — Setup Complete

**Status: ✅ LIVE as of May 2026**
**Endpoint:** `https://juva.design/api/contact`
**Leads land in:** `hello@juva.design`

---

## How It Works

```
Visitor fills form on juva.design
        ↓
/api/contact  (Next.js API route)
        ↓
Resend API sends two emails simultaneously:
  1. YOU  → hello@juva.design   (instant lead notification)
  2. THEM → their email          (branded auto-reply)
```

### Forms covered
| Form | Trigger | File |
|---|---|---|
| Quote Wizard | `/en/contact` — 5-step form | `components/QuoteWizard.tsx` |
| Exit Intent | Mouse leaves page after 8s | `components/ExitIntent.tsx` |

Both post to `/api/contact`. Same endpoint, same emails.

---

## What You Receive (hello@juva.design)

**Subject:** `🔥 New lead — John Smith · Website`

The email contains:
- Source (quote-wizard or exit-intent)
- Full name, email, phone
- Service, scope, budget, timeline
- Any extra details they typed
- **Reply-To is set to the lead's email** — just hit Reply to respond directly

---

## What They Receive (auto-reply)

**Subject:** `Got it — JUVA will follow up within 24 hours`

Branded dark-theme email in their language (English or French, auto-detected from which version of the site they used).

---

## Environment Variables (Vercel)

| Variable | Value | Purpose |
|---|---|---|
| `RESEND_API_KEY` | `re_***` (encrypted) | Sends emails via Resend |
| `NEXT_PUBLIC_SITE_URL` | `https://juva.design` | Sitemap, OG tags |

> To view or rotate the key: [vercel.com](https://vercel.com) → juva-next → Settings → Environment Variables

---

## Files Changed

| File | What changed |
|---|---|
| `app/api/contact/route.ts` | New — handles POST, sends via Resend |
| `lib/config.ts` | `formEndpoint` now points to `/api/contact` |
| `package.json` | Added `resend` package |

---

## Resend Account

- **Dashboard:** [resend.com](https://resend.com) — sign in with `laurent@juva.design`
- **Free tier:** 100 emails/day, 3,000/month — more than enough for leads
- **Paid upgrade:** if you ever exceed limits, $20/month for 50K emails

### Verify your domain (optional but recommended)

Right now emails send from `onboarding@resend.dev` (Resend's default domain). To send from `hello@juva.design` instead:

1. In Resend dashboard → **Domains** → **Add Domain** → type `juva.design`
2. Resend gives you DNS records to add (3 TXT records)
3. Add them at your domain registrar (where you bought juva.design)
4. Wait ~10 min for verification
5. Update two lines in `app/api/contact/route.ts`:

```ts
// Change these two lines:
const FROM_LEADS = 'JUVA Leads <hello@juva.design>';
const FROM_REPLY = 'JUVA Studio <hello@juva.design>';
```

6. Commit and run `npx vercel --prod`

---

## Testing the Form

1. Go to **[juva.design/en/contact](https://juva.design/en/contact)**
2. Fill all 5 steps with test data (use a real email you can check)
3. Click **Submit**
4. You should see the green success screen

Then check:
- ✅ `hello@juva.design` inbox — new lead notification
- ✅ The test email inbox — branded auto-reply received
- ✅ No error banner on the form

### Test exit-intent popup
1. Go to **[juva.design/en](https://juva.design/en)**
2. Wait 8 seconds
3. Move your mouse quickly above the browser tab bar
4. The popup appears — enter an email and submit
5. Same notification lands in `hello@juva.design`

---

## Troubleshooting

### Form shows red error banner
- The `RESEND_API_KEY` env var may be missing or wrong
- Check: Vercel → juva-next → Settings → Environment Variables
- Check Vercel function logs: Vercel → juva-next → Deployments → latest → Functions → `/api/contact`

### No email arriving
- Check spam in `hello@juva.design`
- Check Resend dashboard → **Emails** tab — shows every send attempt and delivery status
- If it shows "delivered" but not in inbox, check spam filters

### Emails come from onboarding@resend.dev
- Expected until you verify `juva.design` in Resend (see "Verify your domain" section above)
- Emails still deliver correctly — this is just the sender display name

### Form worked before but stopped
- Resend API key may have been rotated or deleted
- Log in to resend.com → API Keys → confirm the key still exists
- If deleted, create a new one and update `RESEND_API_KEY` in Vercel, then redeploy

---

## Rotating the API Key (if compromised)

1. Go to [resend.com](https://resend.com) → **API Keys** → delete the current key
2. Create a new one → copy it
3. In Vercel: juva-next → Settings → Environment Variables → edit `RESEND_API_KEY`
4. Run `npx vercel --prod` from `D:\CLAUDE CO\claude code\juva-next`

---

*Built May 2026 — Next.js API route + Resend. No Google Apps Script required.*
