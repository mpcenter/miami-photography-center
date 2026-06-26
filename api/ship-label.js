// Vercel Serverless Function — ship-in label (PDF) by email.
// For customers whose repair is already approved: builds a "ship to MPC" label
// (no carrier postage — they add postage at their carrier) and emails it as a
// PDF attachment to the customer, with a copy to the shop. The page only shows
// a confirmation; the customer downloads/prints the PDF from the email.
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

export async function buildPdf({ locale, name, address, phone, equipment, items }) {
  const es = locale === 'es';
  const T = es
    ? { title: 'Etiqueta de envío — Reparación', shipTo: 'ENVIAR A', from: 'REMITENTE', equip: 'Equipo', items: 'Equipos', note: 'Empaca el equipo con protección, pega esta etiqueta por fuera de la caja y añade el franqueo en tu transportista (USPS / UPS / FedEx). Dudas: (786) 763-2091.' }
    : { title: 'Ship-in label - Repair', shipTo: 'SHIP TO', from: 'FROM', equip: 'Equipment', items: 'Items', note: 'Pack the gear securely, tape this label to the outside of the box, and add postage at your carrier (USPS / UPS / FedEx). Questions: (786) 763-2091.' };

  const INK = rgb(0.114, 0.114, 0.122);
  const GRAY = rgb(0.43, 0.43, 0.45);
  const YELLOW = rgb(1, 1, 0);

  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // US Letter
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Outer border
  const L = 56, R = 556, TOP = 750, BOT = 300;
  page.drawRectangle({ x: L, y: BOT, width: R - L, height: TOP - BOT, borderColor: INK, borderWidth: 2 });
  const cl = L + 26; // content left

  // Header: brand
  page.drawText('MPC', { x: cl, y: TOP - 44, size: 30, font: bold, color: INK });
  page.drawText(ascii(T.title), { x: cl, y: TOP - 60, size: 9, font, color: GRAY });
  page.drawLine({ start: { x: cl, y: TOP - 74 }, end: { x: R - 26, y: TOP - 74 }, thickness: 1.5, color: INK });

  // Ship to (big)
  let y = TOP - 100;
  page.drawText(ascii(T.shipTo), { x: cl, y, size: 10, font: bold, color: GRAY });
  y -= 26;
  for (const line of [SHOP.name, SHOP.street, SHOP.city, SHOP.phone]) {
    page.drawText(ascii(line), { x: cl, y, size: 19, font: bold, color: INK });
    y -= 25;
  }

  // From (name + address may wrap + phone)
  y -= 14;
  page.drawText(ascii(T.from), { x: cl, y, size: 10, font: bold, color: GRAY });
  y -= 20;
  page.drawText(ascii(name), { x: cl, y, size: 13, font, color: INK });
  y -= 18;
  for (const aline of wrap(address, font, 13, R - L - 52)) {
    page.drawText(aline, { x: cl, y, size: 13, font, color: INK });
    y -= 18;
  }
  page.drawText(ascii(phone), { x: cl, y, size: 13, font, color: INK });
  y -= 18;

  // Equipment (may wrap)
  if (equipment) {
    y -= 8;
    const eq = `${T.equip}: ${equipment}${items ? `   ${T.items}: ${items}` : ''}`;
    for (const eline of wrap(eq, font, 12, R - L - 52)) {
      page.drawText(eline, { x: cl, y, size: 12, font, color: INK });
      y -= 16;
    }
  }

  // Note box (yellow) — measured with the SAME bold font we draw with, so the
  // text always stays inside the box (regular-font widths underestimated bold).
  const noteLines = wrap(T.note, bold, 11, R - L - 56);
  const boxH = 20 + noteLines.length * 15;
  const boxY = BOT + 18;
  page.drawRectangle({ x: L + 14, y: boxY, width: R - L - 28, height: boxH, color: YELLOW });
  let ny = boxY + boxH - 17;
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

  if (body.website) return res.status(200).json({ ok: true });
  if (!API_KEY) return res.status(500).json({ ok: false, error: 'Email service not configured (RESEND_API_KEY missing)' });

  const locale = body.locale === 'es' ? 'es' : 'en';
  const name = (body.name || '').trim();
  const address = (body.address || '').trim();
  const phone = (body.phone || '').trim();
  const email = (body.email || '').trim();
  const equipment = (body.equipment || '').trim();
  const items = (body.items || '').toString().trim();

  if (!name || !address || !phone || !email) return res.status(400).json({ ok: false, error: 'Missing required fields' });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ ok: false, error: 'Invalid email' });

  let pdfBase64;
  try {
    pdfBase64 = await buildPdf({ locale, name, address, phone, equipment, items });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'PDF generation failed', detail: String(err) });
  }

  const filename = 'mpc-ship-label.pdf';
  const { subject, html: bodyHtml } = buildEmail({ locale });

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
      return res.status(502).json({ ok: false, error: 'Email delivery failed', detail });
    }
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'Email delivery failed', detail: String(err) });
  }

  return res.status(200).json({ ok: true });
}

// Builds the mail-in repair instructions email (subject + HTML), localized.
export function buildEmail({ locale }) {
  const es = locale === 'es';
  const subject = es
    ? 'Instrucciones para tu envío de reparación'
    : 'Mail-In Repair Instructions';

  const C = es
    ? {
        h: 'Instrucciones para envío de reparación',
        intro: 'Gracias por elegir a Miami Photography Center para tu reparación. Sigue estas instrucciones con cuidado para que podamos procesar tu equipo de la forma más rápida y segura posible.',
        labelNote: 'Adjuntamos tu <strong>etiqueta de envío en PDF</strong>. Imprímela y pégala por fuera de la caja. Añade el franqueo en tu transportista (USPS / UPS / FedEx).',
        beforeH: 'Antes de enviar',
        beforeP: 'Retira los siguientes artículos, salvo que estén directamente relacionados con el problema reportado:',
        removeItems: ['Tarjetas de memoria', 'Correas de cámara', 'Bolsas o estuches', 'Filtros', 'Accesorios personales', 'Cables', 'Cargadores', 'Battery grips (empuñaduras)', 'Cualquier otro accesorio no relacionado con la reparación'],
        batteryH: 'Batería',
        batteryP: 'Deja la batería instalada solo si es necesaria para diagnosticar o probar el equipo. Si el problema no tiene relación con la energía o el funcionamiento, puedes retirar la batería antes de enviar.',
        packH: 'Embalaje',
        packItems: ['Usa una caja de cartón resistente y en buen estado.', 'Envuelve el equipo con abundante plástico de burbujas.', 'Deja al menos 5 cm (2 pulgadas) de amortiguación entre el equipo y cada lado de la caja.', 'Rellena los espacios vacíos con material de embalaje para evitar que el equipo se mueva durante el transporte.'],
        footer: 'Miami Photography Center · 3911 SW 27th St, West Park, FL 33023 · +1 (786) 763-2091',
      }
    : {
        h: 'Mail-In Repair Instructions',
        intro: 'Thank you for choosing Miami Photography Center for your repair. Please follow these instructions carefully to help us process your equipment as quickly and safely as possible.',
        labelNote: 'Your <strong>ship-in label (PDF)</strong> is attached. Print it and tape it to the outside of the box. Add postage at your carrier (USPS / UPS / FedEx).',
        beforeH: 'Before Shipping',
        beforeP: 'Please remove the following items unless they are directly related to the reported problem:',
        removeItems: ['Memory cards', 'Camera straps', 'Camera bags or cases', 'Filters', 'Personal accessories', 'Cables', 'Chargers', 'Battery grips', 'Any other accessories not related to the repair'],
        batteryH: 'Battery',
        batteryP: 'Please leave the battery installed only if it is necessary to diagnose or test the equipment. If the issue is unrelated to power or operation, you may remove the battery before shipping.',
        packH: 'Packaging',
        packItems: ['Use a sturdy cardboard box in good condition.', 'Wrap the equipment with plenty of bubble wrap.', 'Leave at least 2 inches (5 cm) of protective cushioning between the equipment and every side of the box.', 'Fill any empty spaces with packing material to prevent movement during transit.'],
        footer: 'Miami Photography Center · 3911 SW 27th St, West Park, FL 33023 · +1 (786) 763-2091',
      };

  const li = (arr) => arr.map((x) => `<li style="margin:0 0 6px;">${esc(x)}</li>`).join('');
  const bodyHtml = `<!doctype html><html><body style="margin:0;background:#f4f4f5;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1d1d1f;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
      <div style="background:#1d1d1f;padding:20px 28px;">
        <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:0.04em;">MPC</span>
        <span style="color:#9b9b9f;font-size:12px;display:block;margin-top:2px;">Miami Photography Center</span>
      </div>
      <div style="padding:28px;">
        <h1 style="font-size:20px;margin:0 0 14px;">${esc(C.h)}</h1>
        <p style="margin:0 0 20px;line-height:1.55;">${esc(C.intro)}</p>
        <div style="background:#fffae6;border:1px solid #f2e27a;border-radius:10px;padding:14px 16px;margin:0 0 24px;line-height:1.5;font-size:14px;">${C.labelNote}</div>

        <h2 style="font-size:16px;margin:0 0 8px;">${esc(C.beforeH)}</h2>
        <p style="margin:0 0 10px;line-height:1.5;">${esc(C.beforeP)}</p>
        <ul style="margin:0 0 20px;padding-left:20px;line-height:1.5;">${li(C.removeItems)}</ul>

        <h2 style="font-size:16px;margin:0 0 8px;">${esc(C.batteryH)}</h2>
        <p style="margin:0 0 20px;line-height:1.55;">${esc(C.batteryP)}</p>

        <h2 style="font-size:16px;margin:0 0 8px;">${esc(C.packH)}</h2>
        <ul style="margin:0;padding-left:20px;line-height:1.5;">${li(C.packItems)}</ul>
      </div>
      <div style="border-top:1px solid #ececee;padding:16px 28px;font-size:12px;color:#9b9b9f;line-height:1.5;">${esc(C.footer)}</div>
    </div>
  </body></html>`;

  return { subject, html: bodyHtml };
}
