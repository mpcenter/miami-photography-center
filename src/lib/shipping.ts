/* Store shipping model — "per-product continental rate + fixed HI/AK surcharge".
   Each product sets its own continental-US shipping cost (product.shipping, USD);
   Hawaii and Alaska add a fixed surcharge the buyer selects at Stripe checkout.
   Derived from the client's UPS zone table (HI ≈ +$15, AK ≈ +$43 over continental).

   Keep these in sync with the env defaults in api/checkout.js
   (SHIP_DEFAULT_CENTS / SHIP_HI_SURCHARGE_CENTS / SHIP_AK_SURCHARGE_CENTS). */
export const SHIPPING = {
  /** Fallback continental rate when a product has no `shipping` set (USD). */
  defaultUsd: 15,
  /** Added on top of the continental rate for Hawaii (USD). */
  hiSurchargeUsd: 15,
  /** Added on top of the continental rate for Alaska (USD). */
  akSurchargeUsd: 43,
};

/** Continental rate for a product, falling back to the default. */
export const continentalShipping = (shipping?: number): number =>
  typeof shipping === 'number' && shipping >= 0 ? shipping : SHIPPING.defaultUsd;
