// Vercel Serverless Function — repair send-in intake.
// Receives the repair form, generates a reference number, and emails a
// printable intake/shipping sheet to the customer (and a copy to the shop)
// via Resend. Works with the static Astro site: Vercel serves everything in
// /api as functions regardless of the framework.
//
// Required env var (set in the Vercel project): RESEND_API_KEY
// Optional env vars: SHOP_EMAIL, FROM_EMAIL

// Env vars are read case-insensitively (FROM_EMAIL or from_email) to avoid
// casing footguns when set in the dashboard.
const SHOP_EMAIL = process.env.SHOP_EMAIL || process.env.shop_email || 'service@miamiphotographycenter.com';
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.from_email || 'Miami Photography Center <service@miamiphotographycenter.com>';
// Resend's shared test sender (onboarding@resend.dev) can only deliver to the
// account owner, so we skip the shop bcc when testing with it.
const IS_TEST_SENDER = /resend\.dev/i.test(FROM_EMAIL);

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

function buildSheet({ locale, reference, name, address, phone, email, brand, model, message, items }) {
  const es = locale === 'es';
  const T = es
    ? {
        title: 'Hoja de envío — Reparación',
        intro: 'Imprime esta hoja y pégala (o métela) en tu paquete antes de enviarlo.',
        ref: 'Número de referencia',
        shipTo: 'Enviar a',
        customer: 'Datos del cliente',
        name: 'Nombre',
        address: 'Dirección',
        phone: 'Teléfono',
        email: 'Correo',
        equipment: 'Equipo',
        brand: 'Marca',
        model: 'Modelo',
        items: 'Nº de equipos',
        problem: 'Problema reportado',
        tips: 'Antes de enviar',
        tip1: 'Empaca el equipo con protección (espuma o burbujas) y batería/tarjeta fuera si es posible.',
        tip2: 'Incluye esta hoja dentro de la caja y escribe el número de referencia por fuera.',
        tip3: 'Te contactaremos en un día hábil con el diagnóstico y el presupuesto.',
        footer: 'Diagnóstico gratuito · Garantía de 6 meses · Est. 2011',
      }
    : {
        title: 'Shipping Sheet — Repair',
        intro: 'Print this sheet and tape it to (or place it inside) your package before shipping.',
        ref: 'Reference number',
        shipTo: 'Ship to',
        customer: 'Customer details',
        name: 'Name',
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        equipment: 'Equipment',
        brand: 'Brand',
        model: 'Model',
        items: 'Items',
        problem: 'Reported problem',
        tips: 'Before you ship',
        tip1: 'Pack the gear with protection (foam or bubble wrap); remove battery/card if possible.',
        tip2: 'Include this sheet inside the box and write the reference number on the outside.',
        tip3: 'We will contact you within one business day with the diagnosis and quote.',
        footer: 'Free diagnostic · 6-month warranty · Est. 2011',
      };

  const row = (label, value) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#6e6e73;font-size:13px;vertical-align:top;white-space:nowrap;">${esc(label)}</td><td style="padding:6px 0;color:#1d1d1f;font-size:15px;font-weight:600;">${esc(value)}</td></tr>`;

  return `<!doctype html><html lang="${es ? 'es' : 'en'}"><body style="margin:0;background:#f5f5f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <div style="background:#1d1d1f;border-radius:16px 16px 0 0;padding:22px 28px;">
      <span style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.02em;">MPC</span>
      <span style="color:#9a9aa0;font-size:13px;margin-left:10px;">${esc(T.title)}</span>
    </div>
    <div style="background:#fff;padding:24px 28px;">
      <p style="margin:0 0 18px;color:#1d1d1f;font-size:15px;">${esc(T.intro)}</p>

      <div style="background:#ffff00;border-radius:12px;padding:14px 18px;margin-bottom:22px;">
        <div style="color:#1d1d1f;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">${esc(T.ref)}</div>
        <div style="color:#1d1d1f;font-size:26px;font-weight:800;letter-spacing:0.02em;">${esc(reference)}</div>
      </div>

      <h3 style="margin:0 0 6px;color:#1d1d1f;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">${esc(T.shipTo)}</h3>
      <p style="margin:0 0 22px;color:#1d1d1f;font-size:15px;font-weight:600;line-height:1.5;">
        ${esc(SHOP.name)}<br/>${esc(SHOP.street)}<br/>${esc(SHOP.city)}<br/>${esc(SHOP.phone)}
      </p>

      <h3 style="margin:0 0 4px;color:#1d1d1f;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">${esc(T.customer)}</h3>
      <table style="border-collapse:collapse;margin-bottom:18px;width:100%;">
        ${row(T.name, name)}
        ${row(T.address, address)}
        ${row(T.phone, phone)}
        ${row(T.email, email)}
      </table>

      <h3 style="margin:0 0 4px;color:#1d1d1f;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">${esc(T.equipment)}</h3>
      <table style="border-collapse:collapse;margin-bottom:18px;width:100%;">
        ${row(T.brand, brand)}
        ${row(T.model, model)}
        ${row(T.items, items)}
        ${row(T.problem, message)}
      </table>

      <h3 style="margin:0 0 8px;color:#1d1d1f;font-size:13px;text-transform:uppercase;letter-spacing:0.04em;">${esc(T.tips)}</h3>
      <ol style="margin:0 0 8px;padding-left:18px;color:#1d1d1f;font-size:14px;line-height:1.6;">
        <li>${esc(T.tip1)}</li>
        <li>${esc(T.tip2)}</li>
        <li>${esc(T.tip3)}</li>
      </ol>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;border-top:1px solid #ededf0;padding:16px 28px;color:#6e6e73;font-size:12px;">
      ${esc(T.footer)} · ${esc(SHOP.name)} · ${esc(SHOP.phone)}
    </div>
  </div>
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

  // Honeypot: bots fill the hidden "company" field. Pretend success.
  if (body.company) return res.status(200).json({ ok: true, reference: makeReference() });

  const locale = body.locale === 'es' ? 'es' : 'en';
  const name = (body.name || '').trim();
  const address = (body.address || '').trim();
  const phone = (body.phone || '').trim();
  const email = (body.email || '').trim();
  const brand = (body.brand || '').trim();
  const model = (body.model || '').trim();
  const message = (body.message || '').trim();
  const items = (body.items || '').toString().trim();

  if (!name || !address || !phone || !email || !brand || !model || !message) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ ok: false, error: 'Email service not configured (RESEND_API_KEY missing)' });
  }

  const reference = makeReference();
  const html = buildSheet({ locale, reference, name, address, phone, email, brand, model, message, items });
  const subject =
    locale === 'es'
      ? `MPC — Hoja de envío de reparación (${reference})`
      : `MPC — Repair shipping sheet (${reference})`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        ...(IS_TEST_SENDER ? {} : { bcc: [SHOP_EMAIL] }),
        reply_to: SHOP_EMAIL,
        subject,
        html,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ ok: false, error: 'Email send failed', detail });
    }
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'Email send error', detail: String(err) });
  }

  return res.status(200).json({ ok: true, reference });
}
