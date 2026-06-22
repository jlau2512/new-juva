/**
 * JUVA Lead Capture — Google Apps Script (v2)
 * ============================================
 * Handles two kinds of submissions from juva.design:
 *   1) Quote wizard  (source: "quote-wizard")
 *   2) Exit-intent / audit request (source: "exit-intent")
 *
 * Each submission:
 *   - Writes a row to your Google Sheet
 *   - Sends YOU an instant email notification
 *   - Sends the prospect a branded auto-reply
 *
 * SETUP (15 min):
 *   1. sheets.google.com → create "JUVA Leads" → copy the Sheet ID
 *      (the long string between /d/ and /edit in the URL)
 *   2. script.google.com → New project → name it "JUVA Lead Capture"
 *   3. Paste this entire file (replace anything that's there)
 *   4. Update SHEET_ID and NOTIFY_EMAIL below
 *   5. Deploy → New deployment → Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   6. Authorize when prompted (click "Advanced" → "Go to JUVA Lead Capture")
 *   7. Copy the Web App URL (.../exec)
 *   8. In your Vercel project, set env var:
 *        NEXT_PUBLIC_FORM_ENDPOINT = <that URL>
 *      (or paste it into lib/config.ts)
 */

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';  // ← Step 1: paste your Sheet ID here
const NOTIFY_EMAIL = 'hello@juva.design';       // ← Leads will be emailed here
const SHEET_NAME = 'Leads';                     // Tab name inside the spreadsheet

const SERVICE_LABEL = {
  website: 'Website',
  app: 'Custom App',
  brand: 'Brand & Identity',
  audit: 'Free audit (exit-intent)',
  other: 'Other',
};
const BUDGET_LABEL = {
  '<25k': 'Under Rs 25,000',
  '25-50k': 'Rs 25,000 – 50,000',
  '50-100k': 'Rs 50,000 – 100,000',
  '100k+': 'Over Rs 100,000',
};
const TIMELINE_LABEL = {
  asap: 'ASAP',
  '1m': 'Within a month',
  '3m': '1–3 months',
  flex: 'Flexible',
};
const SCOPE_LABEL = {
  small: 'Small (1–5 pages)',
  medium: 'Medium (5–15 pages)',
  large: 'Large (full platform)',
  unsure: 'Not sure',
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Honeypot — silently drop bots
    if (data.website_url && data.website_url.length > 0) {
      return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
        ContentService.MimeType.JSON
      );
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    const headers = [
      'Timestamp', 'Source', 'Locale', 'First Name', 'Last Name', 'Email',
      'Phone', 'Service', 'Scope', 'Budget', 'Timeline', 'Details', 'Status',
    ];

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#050505').setFontColor('#ccff00');
      sheet.setFrozenRows(1);
      sheet.setColumnWidths(1, headers.length, 140);
    }

    const ts = new Date().toLocaleString('en-MU', { timeZone: 'Indian/Mauritius' });
    sheet.appendRow([
      ts,
      data.source || 'website',
      data.locale || '',
      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.phone || '',
      SERVICE_LABEL[data.service] || data.service || '',
      SCOPE_LABEL[data.scope] || data.scope || '',
      BUDGET_LABEL[data.budget] || data.budget || '',
      TIMELINE_LABEL[data.timeline] || data.timeline || '',
      data.details || '',
      'New',
    ]);

    const last = sheet.getLastRow();
    if (last % 2 === 0) sheet.getRange(last, 1, 1, headers.length).setBackground('#fafafa');

    notifyJuva(data);
    if (data.email) sendAutoReply(data);

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(
      ContentService.MimeType.JSON
    );
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function notifyJuva(d) {
  const fullName = `${d.firstName || ''} ${d.lastName || ''}`.trim() || '(no name)';
  const service = SERVICE_LABEL[d.service] || d.service || '—';
  const subject = `🔥 New lead — ${fullName} · ${service}`;
  const lines = [
    `Source: ${d.source || 'website'}`,
    `Name: ${fullName}`,
    `Email: ${d.email || '—'}`,
    `Phone: ${d.phone || '—'}`,
    `Service: ${service}`,
    `Scope: ${SCOPE_LABEL[d.scope] || d.scope || '—'}`,
    `Budget: ${BUDGET_LABEL[d.budget] || d.budget || '—'}`,
    `Timeline: ${TIMELINE_LABEL[d.timeline] || d.timeline || '—'}`,
    '',
    'Details:',
    d.details || '(none)',
  ].join('\n');

  GmailApp.sendEmail(NOTIFY_EMAIL, subject, lines, {
    replyTo: d.email || NOTIFY_EMAIL,
    name: 'JUVA Leads',
  });
}

function sendAutoReply(d) {
  const isFr = (d.locale || 'en') === 'fr';
  const subject = isFr
    ? 'Bien reçu — la team JUVA revient vers vous sous 24h'
    : 'Got it — JUVA will follow up within 24 hours';
  const body = isFr
    ? `Bonjour ${d.firstName || ''},\n\nMerci pour votre message. Nous l’avons bien reçu et reviendrons vers vous personnellement sous 24h ouvrées.\n\nEn attendant, n’hésitez pas à répondre à cet email avec toute info supplémentaire (lien, deadline, exemples).\n\n— L’équipe JUVA\nhello@juva.design · juva.design`
    : `Hi ${d.firstName || ''},\n\nThanks for reaching out. We received your message and will follow up personally within 24 business hours.\n\nIn the meantime, feel free to reply to this email with any extra context (links, deadline, references).\n\n— The JUVA team\nhello@juva.design · juva.design`;

  GmailApp.sendEmail(d.email, subject, body, { name: 'JUVA Studio' });
}

// Optional: supports CORS preflight if browser sends one.
function doOptions() {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}
