"use client";

import { sendGAEvent } from "@next/third-parties/google";
import { getPlan, type SubscriptionPlanId } from "@/lib/stripe/plans";

const STORAGE_PREFIX = "ga_purchase_";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a one-time GA4 / Google Ads `purchase` conversion for a completed checkout.
 * Deduped per browser session so in-app success + Stripe return_url don't double-count.
 */
export function trackPurchase(opts: {
  planId: SubscriptionPlanId;
  transactionId?: string | null;
}): void {
  if (typeof window === "undefined") return;

  const plan = getPlan(opts.planId);
  const transactionId =
    opts.transactionId?.trim() || `plan_${opts.planId}_success`;
  const planKey = `${STORAGE_PREFIX}plan_${opts.planId}`;
  const txKey = `${STORAGE_PREFIX}${transactionId}`;

  try {
    if (sessionStorage.getItem(planKey) || sessionStorage.getItem(txKey)) {
      return;
    }
    sessionStorage.setItem(planKey, "1");
    sessionStorage.setItem(txKey, "1");
  } catch {
    // private / blocked storage — still attempt to send
  }

  const payload = {
    transaction_id: transactionId,
    value: plan.price,
    currency: "CAD",
    items: [
      {
        item_id: plan.id,
        item_name: `RedSealGuide ${plan.name}`,
        price: plan.price,
        quantity: 1,
      },
    ],
  };

  try {
    sendGAEvent("event", "purchase", payload);
  } catch {
    window.gtag?.("event", "purchase", payload);
  }
}
