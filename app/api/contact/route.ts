import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// ── Notion ────────────────────────────────────────────────────────────────────
const NOTION_DB = process.env.NOTION_DATABASE_ID ?? '';
const NOTION_VER = '2022-06-28';

async function notionAddLead(d: Record<string, string>) {
  // Strip BOM (U+FEFF) that Windows shells sometimes prepend, plus any whitespace
  const rawToken = process.env.NOTION_TOKEN ?? '';
  const token = rawToken.charCodeAt(0) === 0xFEFF ? rawToken.slice(1).trim() : rawToken.trim();
  if (!token || !NOTION_DB) return; // silently skip if not configured

  const fullName = `${d.firstName || ''} ${d.lastName || ''}`.trim() || '(no name)';

  const body = {
    parent: { database_id: NOTION_DB },
    properties: {
      Lead:     { title:       [{ text: { content: fullName } }] },
      Email:    { email:        d.email    || null },
      Phone:    { phone_number: d.phone    || null },
      Service:  { select:      d.service  ? { name: SERVICE[d.service]   || d.service  } : null },
      Scope:    { select:      d.scope    ? { name: SCOPE[d.scope]       || d.scope    } : null },
      Budget:   { select:      d.budget   ? { name: BUDGET_N[d.budget]   || d.budget   } : null },
      Timeline: { select:      d.timeline ? { name: TIMELINE[d.timeline] || d.timeline } : null },
      Details:  { rich_text:   d.details  ? [{ text: { content: d.details } }] : [] },
      Source:   { select:      d.source   ? { name: d.source   } : { name: 'website' } },
      Locale:   { select:      d.locale   ? { name: d.locale   } : { name: 'en'      } },
      Status:   { select:      { name: 'New' } },
    },
  };

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VER,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.warn('[/api/contact] Notion error:', res.status, txt);
  }
}

// ── Label maps ────────────────────────────────────────────────────────────────
const SERVICE: Record<string, string> = {
  website:  'Website',
  app:      'Custom App',
  brand:    'Brand & Identity',
  audit:    'Free audit (exit-intent)',
  other:    'Other',
};
const SCOPE: Record<string, string> = {
  small:  'Small (1–5 pages)',
  medium: 'Medium (5–15 pages)',
  large:  'Large (full platform)',
  unsure: 'Not sure',
};
const BUDGET: Record<string, string> = {
  '<25k':   'Under Rs 25,000',
  '25-50k': 'Rs 25,000 – 50,000',
  '50-100k':'Rs 50,000 – 100,000',
  '100k+':  'Over Rs 100,000',
};
// Notion select options use short names (commas not allowed in Notion option names)
const BUDGET_N: Record<string, string> = {
  '<25k':   'Under Rs 25k',
  '25-50k': 'Rs 25k-50k',
  '50-100k':'Rs 50k-100k',
  '100k+':  'Over Rs 100k',
};
const TIMELINE: Record<string, string> = {
  asap: 'ASAP',
  '1m': 'Within a month',
  '3m': '1–3 months',
  flex: 'Flexible',
};

// Domain juva.design verified in Resend — sending from/to @juva.design addresses.
const NOTIFY_TO  = 'hello@juva.design';
const FROM_LEADS = 'JUVA Leads <hello@juva.design>';
const FROM_REPLY = 'JUVA Studio <hello@juva.design>';

// ── POST /api/contact ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Honeypot — silently drop bots
    if (data.website_url) return NextResponse.json({ ok: true });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY env var missing');

    const resend = new Resend(apiKey);

    const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim() || '(no name)';
    const service  = SERVICE[data.service]   || data.service   || '—';
    const scope    = SCOPE[data.scope]       || data.scope     || '—';
    const budget   = BUDGET[data.budget]     || data.budget    || '—';
    const timeline = TIMELINE[data.timeline] || data.timeline  || '—';
    const isFr     = (data.locale || 'en') === 'fr';

    // ── 1. Notify NOTIFY_TO ───────────────────────────────────────────────────
    const { error: notifyError } = await resend.emails.send({
      from:     FROM_LEADS,
      to:       NOTIFY_TO,
      replyTo:  data.email || NOTIFY_TO,
      subject:  `🔥 New lead — ${fullName} · ${service}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0a09;color:#e8e5dc;padding:32px;border-radius:12px">
          <div style="border-bottom:2px solid #D4AF37;padding-bottom:16px;margin-bottom:24px">
            <span style="font-size:22px;font-weight:800;letter-spacing:0.08em;color:#fff">JUVA</span>
            <span style="color:#888;font-size:12px;margin-left:10px;text-transform:uppercase;letter-spacing:0.15em">New Lead</span>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            ${row('Source',   data.source || 'website')}
            ${row('Name',     fullName)}
            ${row('Email',    data.email  || '—', data.email ? `mailto:${data.email}` : undefined)}
            ${row('Phone',    data.phone  || '—')}
            ${row('Service',  service)}
            ${row('Scope',    scope)}
            ${row('Budget',   budget)}
            ${row('Timeline', timeline)}
          </table>
          ${data.details ? `
          <div style="margin-top:20px;padding:16px;background:#141413;border-radius:8px;border:1px solid #2a2a28">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#888;margin-bottom:8px">Details</div>
            <div style="font-size:14px;line-height:1.7;color:#e8e5dc">${data.details}</div>
          </div>` : ''}
          <div style="margin-top:28px;padding-top:16px;border-top:1px solid #1e1e1c;font-size:12px;color:#555">
            juva.design · hello@juva.design · +230 5793 6857 · +230 5968 6136
          </div>
        </div>
      `,
    });

    if (notifyError) throw new Error(`Resend notify error: ${JSON.stringify(notifyError)}`);

    // ── 2. Log to Notion CRM ──────────────────────────────────────────────────
    try { await notionAddLead(data); } catch (nErr) { console.warn('[/api/contact] Notion error:', nErr); }

    // ── 3. Auto-reply to the lead ─────────────────────────────────────────────
    if (data.email) {
      const subject = isFr
        ? 'Bien reçu — la team JUVA revient vers vous sous 24h'
        : 'Got it — JUVA will follow up within 24 hours';

      const { error: replyError } = await resend.emails.send({
        from:    FROM_REPLY,
        to:      data.email,
        subject,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;background:#0a0a09;color:#e8e5dc;padding:32px;border-radius:12px">
            <div style="border-bottom:2px solid #D4AF37;padding-bottom:16px;margin-bottom:24px">
              <span style="font-size:22px;font-weight:800;letter-spacing:0.08em;color:#fff">JUVA</span>
              <span style="color:#888;font-size:12px;margin-left:10px;text-transform:uppercase;letter-spacing:0.15em">Studio</span>
            </div>
            <p style="font-size:15px;line-height:1.7;margin:0 0 16px;color:#e8e5dc">
              ${isFr ? `Bonjour <strong>${data.firstName || ''},</strong>` : `Hi <strong>${data.firstName || ''},</strong>`}
            </p>
            <p style="font-size:15px;line-height:1.7;margin:0 0 16px;color:#e8e5dc">
              ${isFr
                ? "Merci pour votre message. Nous l'avons bien reçu et reviendrons vers vous personnellement sous 24h ouvrées."
                : 'Thanks for reaching out. We received your message and will follow up personally within 24 business hours.'}
            </p>
            <p style="font-size:15px;line-height:1.7;margin:0;color:#e8e5dc">
              ${isFr
                ? "N'hésitez pas à répondre à cet email avec toute info supplémentaire (lien, deadline, exemples)."
                : 'Feel free to reply to this email with any extra context (links, deadline, references).'}
            </p>
            <div style="margin-top:32px;padding-top:16px;border-top:1px solid #1e1e1c;font-size:13px;color:#666">
              ${isFr ? "— L'équipe JUVA" : '— The JUVA team'}<br>
              hello@juva.design · <a href="https://juva.design" style="color:#D4AF37;text-decoration:none">juva.design</a>
            </div>
          </div>
        `,
      });
      if (replyError) console.warn('[/api/contact] auto-reply error:', replyError);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/contact]', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function row(label: string, value: string, href?: string) {
  const val = href
    ? `<a href="${href}" style="color:#D4AF37;text-decoration:none">${value}</a>`
    : value;
  return `
    <tr>
      <td style="padding:7px 0;color:#666;width:90px;font-size:11px;text-transform:uppercase;letter-spacing:0.12em;vertical-align:top">${label}</td>
      <td style="padding:7px 0 7px 14px;color:#e8e5dc;font-size:14px">${val}</td>
    </tr>`;
}

// ── CORS preflight ─────────────────────────────────────────────────────────────
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
