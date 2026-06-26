// Vercel Serverless Function — Stripe Checkout for the store.
// Creates a hosted Stripe Checkout Session for one product (shipping only, with
// automatic Florida sales tax via Stripe Tax) and returns the session URL for
// the browser to redirect to.
//
// Gated: if STRIPE_SECRET_KEY is not set, returns { ok:false, reason:
// 'not_configured' } so the storefront keeps its pre-launch placeholder note
// instead of breaking. Flip it live by adding the key in Vercel.
//
// Env: STRIPE_SECRET_KEY. Optional: SITE_URL, SHIPPING_FLAT_CENTS.

import fs from 'node:fs';
import path from 'node:path';
import Stripe from 'stripe';

const SECRET = (process.env.STRIPE_SECRET_KEY || process.env.stripe_secret_key || '').trim();
const SITE_URL = (process.env.SITE_URL || 'https://miamiphotographycenter.com').replace(/\/+$/, '');
// Flat shipping in cents (e.g. 1500 = $15). 0 → free shipping (default).
const SHIPPING_FLAT_CENTS = Math.max(0, parseInt(process.env.SHIPPING_FLAT_CENTS || '0', 10) || 0);

// Products live in src/content/products/*.json (edited via /admin). The file is
// bundled into this function via vercel.json `includeFiles`.
function loadProduct(slug) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) return null; // guard against path traversal
  const file = path.join(process.cwd(), 'src/content/products', `${slug}.json`);
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Gated: the store keeps its pre-launch note until Stripe keys are added.
  if (!SECRET) return res.status(200).json({ ok: false, reason: 'not_configured' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const slug = (body.slug || '').toString().trim();
  const locale = body.locale === 'es' ? 'es' : 'en';
  let quantity = parseInt(body.quantity, 10);
  if (!Number.isFinite(quantity) || quantity < 1) quantity = 1;
  if (quantity > 10) quantity = 10;

  // Price and details are taken from the server-side catalog, never the client.
  const product = loadProduct(slug);
  if (!product || typeof product.price !== 'number' || product.price <= 0) {
    return res.status(400).json({ ok: false, error: 'Product not available' });
  }

  const name = (product.name && (product.name[locale] || product.name.en)) || 'Product';
  const image = product.img
    ? (product.img.startsWith('http') ? product.img : SITE_URL + product.img)
    : undefined;
  const base = locale === 'es' ? `${SITE_URL}/es` : SITE_URL;

  try {
    const stripe = new Stripe(SECRET);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale,
      line_items: [
        {
          quantity,
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(product.price * 100),
            tax_behavior: 'exclusive', // tax added on top of the listed price
            product_data: {
              name,
              ...(image ? { images: [image] } : {}),
              tax_code: 'txcd_99999999', // general tangible goods
              metadata: { slug },
            },
          },
        },
      ],
      automatic_tax: { enabled: true }, // Stripe Tax → Florida sales tax by address
      billing_address_collection: 'required',
      shipping_address_collection: { allowed_countries: ['US'] },
      phone_number_collection: { enabled: true },
      ...(SHIPPING_FLAT_CENTS > 0
        ? {
            shipping_options: [
              {
                shipping_rate_data: {
                  type: 'fixed_amount',
                  display_name: locale === 'es' ? 'Envío' : 'Shipping',
                  fixed_amount: { amount: SHIPPING_FLAT_CENTS, currency: 'usd' },
                  tax_behavior: 'exclusive',
                  tax_code: 'txcd_92010001', // shipping
                },
              },
            ],
          }
        : {}),
      metadata: { slug, quantity: String(quantity) },
      success_url: `${base}/store/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/store/cancel`,
    });

    return res.status(200).json({ ok: true, url: session.url });
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'Checkout failed', detail: String(err?.message || err) });
  }
}
