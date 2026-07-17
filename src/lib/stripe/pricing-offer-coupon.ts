import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/config";
import { PRICING_OFFER_PERCENT } from "@/lib/pricing-offer";

/** Stable coupon id so we reuse one Stripe coupon for the marketing offer. */
export const PRICING_OFFER_COUPON_ID = "redseal_pricing_offer_30";

/**
 * Ensure a 30% once coupon exists for the limited pricing offer.
 * Prefers `STRIPE_PRICING_OFFER_COUPON_ID` when set.
 */
export async function resolvePricingOfferCouponId(): Promise<string | null> {
  if (!stripe) return null;

  const fromEnv = process.env.STRIPE_PRICING_OFFER_COUPON_ID?.trim();
  if (fromEnv) return fromEnv;

  try {
    const existing = await stripe.coupons.retrieve(PRICING_OFFER_COUPON_ID);
    // Deleted coupons come back as { deleted: true } without a `valid` field.
    const isDeleted =
      (existing as Partial<Stripe.DeletedCoupon>).deleted === true;
    if (!isDeleted && existing.valid) return existing.id;
  } catch {
    // create below
  }

  const created = await stripe.coupons.create({
    id: PRICING_OFFER_COUPON_ID,
    percent_off: PRICING_OFFER_PERCENT,
    duration: "once",
    name: "Limited — 30% off",
    metadata: { purpose: "pricing_offer_24h" },
  });
  return created.id;
}
