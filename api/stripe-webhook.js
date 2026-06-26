// Vercel Serverless Function — Stripe webhook.
// On a completed checkout it emails an order notification to the shop (and the
// guaranteed copy) and a confirmation to the customer, reusing Resend. Stripe
// already shows the order in the dashboard and can email its own receipt; this
// is the shop-facing heads-up + a branded confirmation.
//
// Gated: does nothing unless STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET are set.
//
// Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY.
// Optional: SHOP_EMAIL, NOTIFY_EMAIL, FROM_EMAIL.

import Stripe from 'stripe';

// Stripe needs the raw request body to verify the signature.
export const config = { api: { bodyParser: false } };

const SECRET = (process.env.STRIPE_SECRET_KEY || '').trim();
const WEBHOOK_SECRET = (process.env.STRIPE_WEBHOOK_SECRET || '').trim();
const RESEND_KEY = (process.env.RESEND_API_KEY || process.env.resend_api_key || '').trim();
const SHOP_EMAIL = (process.env.SHOP_EMAIL || process.env.shop_email || 'service@miamiphotographycenter.com').trim();
const COPY_EMAIL = (process.env.NOTIFY_EMAIL || process.env.notify_email || 'adminwebmpc@gmail.com').trim();
// Every sale also notifies this owner inbox (configurable via SALES_NOTIFY_EMAIL).
const SALES_EMAIL = (process.env.SALES_NOTIFY_EMAIL || process.env.sales_notify_email || 'miamipcenter@gmail.com').trim();
const FROM_EMAIL = (
  process.env.FROM_EMAIL ||
  process.env.from_email ||
  'Miami Photography Center <service@mail.miamiphotographycenter.com>'
).trim();

const esc = (v) =>
  String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function readRaw(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function sendEmail({ to, subject, html, replyTo }) {
  if (!RESEND_KEY) return;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    // Surface delivery failures in the Vercel logs. The payment already
    // succeeded, so we never fail the webhook here — returning 500 would make
    // Stripe retry and duplicate these emails. The sale is always in Stripe too.
    if (!r.ok) console.error('[stripe-webhook] Resend send failed', r.status, await r.text().catch(() => ''));
  } catch (err) {
    console.error('[stripe-webhook] Resend send error', String(err));
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  if (!SECRET || !WEBHOOK_SECRET) return res.status(200).json({ ok: true, skipped: 'not_configured' });

  const stripe = new Stripe(SECRET);
  let event;
  try {
    const raw = await readRaw(req);
    event = stripe.webhooks.constructEvent(raw, req.headers['stripe-signature'], WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ ok: false, error: `Signature verification failed: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object;
    const cd = s.customer_details || {};
    const ship = s.shipping_details || s.collected_information?.shipping_details || {};
    const addr = ship.address || cd.address || {};
    const amount = ((s.amount_total || 0) / 100).toFixed(2);
    const slug = s.metadata?.slug || '';
    const qty = s.metadata?.quantity || '1';
    const addrLine = [addr.line1, addr.line2, [addr.city, addr.state, addr.postal_code].filter(Boolean).join(', '), addr.country]
      .filter(Boolean)
      .join(' · ');

    const shopHtml = `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1d1d1f;padding:20px;">
      <p style="font-size:18px;font-weight:800;margin:0 0 10px;">🛒 New store order — $${esc(amount)}</p>
      <p style="margin:0 0 4px;"><strong>Product:</strong> ${esc(slug)} ×${esc(qty)}</p>
      <p style="margin:0 0 4px;"><strong>Customer:</strong> ${esc(cd.name || '')} · ${esc(cd.email || '')} · ${esc(cd.phone || '')}</p>
      <p style="margin:0 0 4px;"><strong>Ship to:</strong> ${esc(ship.name || cd.name || '')} — ${esc(addrLine)}</p>
      <p style="margin:12px 0 0;color:#6e6e73;font-size:13px;">Mark this item as sold in /admin so it can’t be bought twice.</p>
    </body></html>`;
    await sendEmail({ to: [...new Set([SHOP_EMAIL, COPY_EMAIL, SALES_EMAIL].filter(Boolean))], subject: `New store order — $${amount}`, html: shopHtml, replyTo: cd.email || undefined });

    if (cd.email) {
      const custHtml = `<!doctype html><html><body style="margin:0;background:#f4f4f5;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#1d1d1f;">
        <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;">
          <div style="background:#1d1d1f;padding:20px 28px;"><span style="color:#fff;font-size:22px;font-weight:800;">MPC</span></div>
          <div style="padding:28px;">
            <h1 style="font-size:20px;margin:0 0 12px;">Thank you for your order</h1>
            <p style="margin:0 0 8px;line-height:1.55;">We’ve received your payment of <strong>$${esc(amount)}</strong> and we’re preparing your shipment. You’ll get tracking by email once it ships.</p>
            <p style="margin:0;color:#6e6e73;font-size:13px;">Questions? Reply to this email or call (786) 763-2091.</p>
          </div>
        </div>
      </body></html>`;
      await sendEmail({ to: [cd.email], subject: 'Your Miami Photography Center order', html: custHtml, replyTo: SHOP_EMAIL });
    }
  }

  return res.status(200).json({ ok: true });
}
