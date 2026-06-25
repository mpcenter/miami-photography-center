// Vercel Serverless Function — printable ship-in label (PDF).
// For customers whose repair is already approved: builds a downloadable PDF
// "ship to MPC" label (no carrier postage — they add postage at their carrier),
// returns it (base64) for download, and emails it as a PDF attachment to the
// customer + a copy to the shop.
//
// Env vars: RESEND_API_KEY. Optional: SHOP_EMAIL, FROM_EMAIL, NOTIFY_EMAIL.

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const API_KEY = (process.env.RESEND_API_KEY || process.env.resend_api_key || '').trim();
const SHOP_EMAIL = (process.env.SHOP_EMAIL || process.env.shop_email || 'service@miamiphotographycenter.com').trim();
const COPY_EMAIL = (process.env.NOTIFY_EMAIL || process.env.notify_email || 'adminwebmpc@gmail.com').trim();
const FROM_EMAIL = (
  process.env.FROM_EMAIL ||
  process.env.from_email ||
  'Miami Photography Center <service@mail.miamiphotographycenter.com>'
).trim();

const SHOP = { name: 'Miami Photography Center', street: '3911 SW 27th St', city: 'West Park, FL 33023', phone: '+1 (786) 763-2091' };

const esc = (v) =>
  String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// pdf-lib's standard fonts use WinAnsi (CP1252), which supports Latin-1 accents
// (á é í ó ú ñ ü ¿ ¡ …). Keep those; only normalize the few chars outside it
// (smart punctuation) and drop anything beyond Latin-1 to avoid encode errors.
const ascii = (s) =>
  String(s == null ? '' : s)
    .normalize('NFC')
    .replace(/[—–]/g, '-')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/[^\x00-\xFF]/g, '');

function makeReference() {
  const d = new Date();
  const ymd = d.getUTCFullYear().toString() + String(d.getUTCMonth() + 1).padStart(2, '0') + String(d.getUTCDate()).padStart(2, '0');
  let rand = '';
  for (let i = 0; i < 4; i++) rand += '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 34)];
  return `MPC-${ymd}-${rand}`;
}

function wrap(text, font, size, maxWidth) {
  const words = ascii(text).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) { lines.push(line); line = w; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

async function buildPdf({ locale, reference, name, address, phone, equipment, items }) {
  const es = locale === 'es';
  const T = es
    ? { title: 'Etiqueta de envío — Reparación', ref: 'Referencia', shipTo: 'ENVIAR A', from: 'REMITENTE', equip: 'Equipo', items: 'Equipos', note: 'Reparación aprobada. Empaca el equipo con protección, pega esta etiqueta por fuera de la caja y añade el franqueo en tu transportista (USPS / UPS / FedEx). Dudas: (786) 763-2091.' }
    : { title: 'Ship-in label - Repair', ref: 'Reference', shipTo: 'SHIP TO', from: 'FROM', equip: 'Equipment', items: 'Items', note: 'Approved repair. Pack the gear securely, tape this label to the outside of the box, and add postage at your carrier (USPS / UPS / FedEx). Questions: (786) 763-2091.' };

  const INK = rgb(0.114, 0.114, 0.122);
  const GRAY = rgb(0.43, 0.43, 0.45);
  const YELLOW = rgb(1, 1, 0);

  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // US Letter
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Outer border
  const L = 56, R = 556, TOP = 740, BOT = 320;
  page.drawRectangle({ x: L, y: BOT, width: R - L, height: TOP - BOT, borderColor: INK, borderWidth: 2 });
  const cl = L + 26; // content left

  // Header: brand + reference
  page.drawText('MPC', { x: cl, y: TOP - 44, size: 30, font: bold, color: INK });
  page.drawText(ascii(T.title), { x: cl, y: TOP - 60, size: 9, font, color: GRAY });
  const refLabel = ascii(T.ref).toUpperCase();
  page.drawText(refLabel, { x: R - 26 - bold.widthOfTextAtSize(refLabel, 8), y: TOP - 30, size: 8, font, color: GRAY });
  page.drawText(ascii(reference), { x: R - 26 - bold.widthOfTextAtSize(ascii(reference), 16), y: TOP - 50, size: 16, font: bold, color: INK });
  page.drawLine({ start: { x: cl, y: TOP - 74 }, end: { x: R - 26, y: TOP - 74 }, thickness: 1.5, color: INK });

  // Ship to (big)
  let y = TOP - 100;
  page.drawText(ascii(T.shipTo), { x: cl, y, size: 10, font: bold, color: GRAY });
  y -= 26;
  for (const line of [SHOP.name, SHOP.street, SHOP.city, SHOP.phone]) {
    page.drawText(ascii(line), { x: cl, y, size: 19, font: bold, color: INK });
    y -= 25;
  }

  // From
  y -= 14;
  page.drawText(ascii(T.from), { x: cl, y, size: 10, font: bold, color: GRAY });
  y -= 20;
  for (const line of [name, address, phone]) {
    page.drawText(ascii(line), { x: cl, y, size: 13, font, color: INK });
    y -= 18;
  }

  // Equipment
  if (equipment) {
    y -= 8;
    const eq = `${ascii(T.equip)}: ${ascii(equipment)}${items ? `   ${ascii(T.items)}: ${ascii(items)}` : ''}`;
    page.drawText(eq, { x: cl, y, size: 12, font, color: INK });
  }

  // Note box (yellow)
  const noteLines = wrap(T.note, font, 11, R - L - 52);
  const boxH = 22 + noteLines.length * 15;
  const boxY = BOT + 20;
  page.drawRectangle({ x: L + 16, y: boxY, width: R - L - 32, height: boxH, color: YELLOW });
  let ny = boxY + boxH - 18;
  for (const line of noteLines) {
    page.drawText(line, { x: L + 28, y: ny, size: 11, font: bold, color: INK });
    ny -= 15;
  }

  const bytes = await doc.save();
  return Buffer.from(bytes).toString('base64');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  if (body.website) return res.status(200).json({ ok: true, reference: makeReference() });
  if (!API_KEY) return res.status(500).json({ ok: false, error: 'Email service not configured (RESEND_API_KEY missing)' });

  const locale = body.locale === 'es' ? 'es' : 'en';
  const name = (body.name || '').trim();
  const address = (body.address || '').trim();
  const phone = (body.phone || '').trim();
  const email = (body.email || '').trim();
  const equipment = (body.equipment || '').trim();
  const items = (body.items || '').toString().trim();
  const provided = (body.reference || '').trim();

  if (!name || !address || !phone || !email) return res.status(400).json({ ok: false, error: 'Missing required fields' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ ok: false, error: 'Invalid email' });

  const reference = provided || makeReference();
  let pdfBase64;
  try {
    pdfBase64 = await buildPdf({ locale, reference, name, address, phone, equipment, items });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'PDF generation failed', detail: String(err) });
  }

  const filename = `mpc-ship-label-${reference}.pdf`;
  const es = locale === 'es';
  const subject = es ? `MPC — Etiqueta de envío (${reference})` : `MPC — Ship-in label (${reference})`;
  const bodyHtml = `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1d1d1f;padding:20px;">
    <p style="font-size:18px;font-weight:700;margin:0 0 8px;">MPC — ${es ? 'Etiqueta de envío' : 'Ship-in label'}</p>
    <p style="margin:0 0 6px;">${es ? 'Adjuntamos tu etiqueta de envío en PDF. Imprímela y pégala por fuera de la caja con tu equipo, y añade el franqueo en tu transportista.' : 'Your ship-in label is attached as a PDF. Print it and tape it to the outside of the box with your gear, then add postage at your carrier.'}</p>
    <p style="margin:0;color:#6e6e73;font-size:13px;">${es ? 'Referencia' : 'Reference'}: <strong>${esc(reference)}</strong></p>
  </body></html>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        bcc: [...new Set([SHOP_EMAIL, COPY_EMAIL].filter(Boolean))],
        reply_to: SHOP_EMAIL,
        subject,
        html: bodyHtml,
        attachments: [{ filename, content: pdfBase64 }],
      }),
    });
    if (!r.ok) {
      const detail = await r.text();
      // Email failed, but still let the user download the PDF.
      return res.status(200).json({ ok: true, reference, pdfBase64, filename, emailWarning: detail });
    }
  } catch (err) {
    return res.status(200).json({ ok: true, reference, pdfBase64, filename, emailWarning: String(err) });
  }

  return res.status(200).json({ ok: true, reference, pdfBase64, filename });
}
