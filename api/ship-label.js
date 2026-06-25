// Vercel Serverless Function — printable ship-in label.
// For customers whose repair is already approved: builds a printable "ship to
// MPC" label (no carrier postage — they add postage at their carrier), emails
// it to the customer + a copy to the shop, and returns the label HTML so the
// page can open it for immediate printing.
//
// Env vars: RESEND_API_KEY. Optional: SHOP_EMAIL, FROM_EMAIL, NOTIFY_EMAIL.

const API_KEY = (process.env.RESEND_API_KEY || process.env.resend_api_key || '').trim();
const SHOP_EMAIL = (process.env.SHOP_EMAIL || process.env.shop_email || 'service@miamiphotographycenter.com').trim();
const COPY_EMAIL = (process.env.NOTIFY_EMAIL || process.env.notify_email || 'adminwebmpc@gmail.com').trim();
const FROM_EMAIL = (
  process.env.FROM_EMAIL ||
  process.env.from_email ||
  'Miami Photography Center <service@mail.miamiphotographycenter.com>'
).trim();

const SHOP = {
  name: 'Miami Photography Center',
  street: '3911 SW 27th St',
  city: 'West Park, FL 33023',
  phone: '+1 (786) 763-2091',
};

const esc = (v) =>
  String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function makeReference() {
  const d = new Date();
  const ymd =
    d.getUTCFullYear().toString() +
    String(d.getUTCMonth() + 1).padStart(2, '0') +
    String(d.getUTCDate()).padStart(2, '0');
  let rand = '';
  for (let i = 0; i < 4; i++) rand += '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random() * 34)];
  return `MPC-${ymd}-${rand}`;
}

function buildLabel({ locale, reference, name, address, phone, email, equipment, items }) {
  const es = locale === 'es';
  const T = es
    ? {
        title: 'Etiqueta de envío — Reparación',
        ref: 'Referencia',
        shipTo: 'Enviar a',
        from: 'Remitente',
        equipment: 'Equipo',
        items: 'Nº de equipos',
        note: 'Reparación aprobada. Empaca el equipo con protección, pega esta etiqueta por fuera de la caja y añade el franqueo en tu transportista (USPS/UPS/FedEx). Dudas: (786) 763-2091.',
        print: 'Imprimir etiqueta',
      }
    : {
        title: 'Ship-in label — Repair',
        ref: 'Reference',
        shipTo: 'Ship to',
        from: 'From',
        equipment: 'Equipment',
        items: 'Items',
        note: 'Approved repair. Pack the gear securely, tape this label to the outside of the box, and add postage at your carrier (USPS/UPS/FedEx). Questions: (786) 763-2091.',
        print: 'Print label',
      };

  return `<!doctype html><html lang="${es ? 'es' : 'en'}"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>MPC — ${esc(reference)}</title>
<style>
  @page { margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#1d1d1f; margin:0; padding:24px; background:#fff; }
  .label { border:2px solid #1d1d1f; border-radius:10px; padding:26px 28px; max-width:660px; margin:0 auto; }
  .row { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; border-bottom:2px solid #1d1d1f; padding-bottom:14px; margin-bottom:18px; }
  .brand { font-size:26px; font-weight:800; letter-spacing:-0.01em; }
  .brand small { display:block; font-size:11px; font-weight:600; color:#6e6e73; letter-spacing:0.04em; text-transform:uppercase; }
  .ref { text-align:right; }
  .ref span { font-size:11px; color:#6e6e73; text-transform:uppercase; letter-spacing:0.06em; }
  .ref b { display:block; font-size:22px; letter-spacing:1px; }
  .h { font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:#6e6e73; margin:0 0 4px; }
  .ship { font-size:27px; font-weight:700; line-height:1.32; margin:0 0 22px; }
  .from { font-size:16px; line-height:1.5; margin:0 0 18px; }
  .meta { font-size:14px; margin:0 0 6px; }
  .note { margin-top:20px; padding:13px 16px; background:#ffff00; border-radius:8px; font-size:13px; font-weight:600; line-height:1.45; }
  .printbtn { display:inline-block; margin:22px auto 0; padding:12px 22px; background:#1d1d1f; color:#fff; border:0; border-radius:999px; font-size:15px; font-weight:600; cursor:pointer; }
  .actions { text-align:center; }
  @media print { .actions { display:none; } body { padding:0; } }
</style></head>
<body>
  <div class="label">
    <div class="row">
      <div class="brand">MPC<small>${esc(T.title)}</small></div>
      <div class="ref"><span>${esc(T.ref)}</span><b>${esc(reference)}</b></div>
    </div>
    <p class="h">${esc(T.shipTo)}</p>
    <p class="ship">${esc(SHOP.name)}<br/>${esc(SHOP.street)}<br/>${esc(SHOP.city)}<br/>${esc(SHOP.phone)}</p>
    <p class="h">${esc(T.from)}</p>
    <p class="from">${esc(name)}<br/>${esc(address)}<br/>${esc(phone)}</p>
    ${equipment ? `<p class="meta"><strong>${esc(T.equipment)}:</strong> ${esc(equipment)}${items ? ` &middot; ${esc(T.items)}: ${esc(items)}` : ''}</p>` : ''}
    <div class="note">${esc(T.note)}</div>
  </div>
  <div class="actions"><button class="printbtn" onclick="window.print()">${esc(T.print)}</button></div>
</body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  if (body.website) return res.status(200).json({ ok: true, reference: makeReference() });

  if (!API_KEY) {
    return res.status(500).json({ ok: false, error: 'Email service not configured (RESEND_API_KEY missing)' });
  }

  const locale = body.locale === 'es' ? 'es' : 'en';
  const name = (body.name || '').trim();
  const address = (body.address || '').trim();
  const phone = (body.phone || '').trim();
  const email = (body.email || '').trim();
  const equipment = (body.equipment || '').trim();
  const items = (body.items || '').toString().trim();
  const provided = (body.reference || '').trim();

  if (!name || !address || !phone || !email) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email' });
  }

  const reference = provided || makeReference();
  const labelHtml = buildLabel({ locale, reference, name, address, phone, email, equipment, items });
  const subject =
    locale === 'es'
      ? `MPC — Etiqueta de envío (${reference})`
      : `MPC — Ship-in label (${reference})`;

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
        html: labelHtml,
      }),
    });
    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ ok: false, error: 'Email send failed', detail });
    }
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'Email send error', detail: String(err) });
  }

  return res.status(200).json({ ok: true, reference, labelHtml });
}
