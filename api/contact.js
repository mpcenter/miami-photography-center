// Vercel Serverless Function — generic form intake.
// Emails any website form's fields to the shop via Resend (verified subdomain
// sender). Used by the contact, on-site/coverage, membership, production, and
// landing-page forms. Returns {ok:false} gracefully so the UI degrades.
//
// Env vars: RESEND_API_KEY (required). Optional: SHOP_EMAIL, FROM_EMAIL.

const API_KEY = (process.env.RESEND_API_KEY || process.env.resend_api_key || '').trim();
const SHOP_EMAIL = (process.env.SHOP_EMAIL || process.env.shop_email || 'service@miamiphotographycenter.com').trim();
// Guaranteed copy so a lead never gets lost if the shop mailbox has issues.
const COPY_EMAIL = (process.env.NOTIFY_EMAIL || process.env.notify_email || 'adminwebmpc@gmail.com').trim();
const RECIPIENTS = [...new Set([SHOP_EMAIL, COPY_EMAIL].filter(Boolean))];
const FROM_EMAIL = (
  process.env.FROM_EMAIL ||
  process.env.from_email ||
  'Miami Photography Center <service@mail.miamiphotographycenter.com>'
).trim();

const esc = (v) =>
  String(v == null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Pretty labels for known field names; unknown keys are title-cased.
const LABELS = {
  name: 'Nombre / Name',
  email: 'Email',
  phone: 'Teléfono / Phone',
  message: 'Mensaje / Message',
  service: 'Servicio / Service',
  location: 'Ubicación / Location',
  address: 'Dirección / Address',
  brand: 'Marca / Brand',
  model: 'Modelo / Model',
  items: 'Equipos / Items',
  gear: 'Equipo / Gear',
  plan: 'Plan',
  date: 'Fecha / Date',
  budget: 'Presupuesto / Budget',
  company: 'Empresa / Company',
  brief: 'Brief',
};

const prettify = (k) =>
  LABELS[k] || k.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

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

  // Honeypot: bots fill the hidden "website" field (real forms never send it).
  if (body.website) return res.status(200).json({ ok: true });

  if (!API_KEY) {
    return res.status(500).json({ ok: false, error: 'Email service not configured (RESEND_API_KEY missing)' });
  }

  const formName = (body._form || 'Website form').toString();
  const locale = body.locale === 'es' ? 'es' : 'en';

  // Collect the real submitted fields (skip internal/control keys + honeypot).
  const skip = new Set(['_form', 'locale', 'website']);
  const entries = Object.entries(body).filter(
    ([k, v]) => !skip.has(k) && v != null && String(v).trim() !== ''
  );

  if (!entries.length) {
    return res.status(400).json({ ok: false, error: 'Empty submission' });
  }

  const customerEmail = (body.email || '').toString().trim();
  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail);

  const rows = entries
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#6e6e73;font-size:13px;vertical-align:top;white-space:nowrap;">${esc(
          prettify(k)
        )}</td><td style="padding:6px 0;color:#1d1d1f;font-size:15px;">${esc(v).replace(/\n/g, '<br/>')}</td></tr>`
    )
    .join('');

  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:620px;margin:0 auto;padding:24px;">
    <div style="background:#1d1d1f;border-radius:14px 14px 0 0;padding:18px 24px;">
      <span style="color:#fff;font-size:18px;font-weight:800;">MPC</span>
      <span style="color:#9a9aa0;font-size:13px;margin-left:10px;">Nueva solicitud · ${esc(formName)}</span>
    </div>
    <div style="background:#fff;padding:22px 24px;border-radius:0 0 14px 14px;">
      <p style="margin:0 0 14px;color:#6e6e73;font-size:13px;">Origen: <strong style="color:#1d1d1f;">${esc(
        formName
      )}</strong> · Idioma: ${locale.toUpperCase()}</p>
      <table style="border-collapse:collapse;width:100%;">${rows}</table>
    </div>
  </div>
</body></html>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: RECIPIENTS,
        ...(emailValid ? { reply_to: customerEmail } : {}),
        subject: `MPC — ${formName}${body.name ? ` · ${body.name}` : ''}`,
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

  return res.status(200).json({ ok: true });
}
