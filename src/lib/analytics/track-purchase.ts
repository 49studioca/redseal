"use client";

import { readAdClickParamsFromDocument } from "@/lib/analytics/ad-click-ids";
import { getPlan, type SubscriptionPlanId } from "@/lib/stripe/plans";
import { trackEvent } from "@/lib/analytics/track-event";

const STORAGE_PREFIX = "ga_purchase_tx_";

export type PurchaseAnalytics = {
  planId: SubscriptionPlanId;
  transactionId: string;
  value: number;
  currency: string;
  subscriptionId?: string | null;
};

function hasTracked(transactionId: string): boolean {
  try {
    return Boolean(localStorage.getItem(`${STORAGE_PREFIX}${transactionId}`));
  } catch {
    return false;
  }
}

function markTracked(transactionId: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${transactionId}`, "1");
  } catch {
    // private / blocked storage — still send the event
  }
}

function attributionParams(): Record<string, string> {
  const params: Record<string, string> = {};
  readAdClickParamsFromDocument().forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

function emitPurchase(data: PurchaseAnalytics): void {
  const plan = getPlan(data.planId);
  const payload = {
    transaction_id: data.transactionId,
    value: data.value,
    currency: data.currency,
    ...attributionParams(),
    items: [
      {
        item_id: plan.id,
        item_name: `RedSealGuide ${plan.name}`,
        item_category: "subscription",
        item_variant: plan.id,
        price: data.value,
        quantity: 1,
      },
    ],
  };

  trackEvent("purchase", payload);
  trackEvent("subscribe", {
    ...payload,
    subscription_id: data.subscriptionId ?? undefined,
    plan_id: plan.id,
    plan_name: plan.name,
  });
}

/**
 * Fire GA4 `purchase` + `subscribe` once per Stripe Checkout Session.
 * Prefer calling {@link trackPurchaseFromSession} so value matches the charged total.
 */
export function trackPurchase(opts: {
  planId: SubscriptionPlanId;
  transactionId?: string | null;
  value?: number | null;
  currency?: string | null;
  subscriptionId?: string | null;
}): void {
  if (typeof window === "undefined") return;

  const transactionId = opts.transactionId?.trim();
  if (!transactionId) {
    console.warn(
      "[analytics] Skipping purchase event without Stripe transaction_id",
    );
    return;
  }

  if (hasTracked(transactionId)) return;
  markTracked(transactionId);

  const plan = getPlan(opts.planId);
  emitPurchase({
    planId: opts.planId,
    transactionId,
    value:
      typeof opts.value === "number" && Number.isFinite(opts.value)
        ? opts.value
        : plan.price,
    currency: (opts.currency ?? "CAD").toUpperCase(),
    subscriptionId: opts.subscriptionId,
  });
}

/**
 * Load the completed Checkout Session from our API, then send GA events with
 * the real Stripe transaction_id, paid value, and subscription id.
 */
export async function trackPurchaseFromSession(opts: {
  sessionId: string;
  fallbackPlanId?: SubscriptionPlanId | null;
}): Promise<void> {
  if (typeof window === "undefined") return;

  const sessionId = opts.sessionId.trim();
  if (!sessionId) return;
  if (hasTracked(sessionId)) return;

  try {
    const res = await fetch(
      `/api/stripe/checkout-session?session_id=${encodeURIComponent(sessionId)}`,
      { credentials: "same-origin" },
    );
    const data = (await res.json()) as {
      transactionId?: string;
      value?: number | null;
      currency?: string;
      planId?: SubscriptionPlanId | null;
      subscriptionId?: string | null;
      paymentStatus?: string;
      error?: string;
    };

    if (!res.ok) {
      throw new Error(data.error ?? "Could not verify checkout session");
    }

    const planId = data.planId ?? opts.fallbackPlanId;
    if (!planId) {
      throw new Error("Checkout session missing plan");
    }

    // Only fire conversion events for paid / no_payment_required sessions.
    const paid =
      data.paymentStatus === "paid" ||
      data.paymentStatus === "no_payment_required";
    if (!paid) {
      console.warn(
        "[analytics] Skipping purchase event until payment succeeds",
        data.paymentStatus,
      );
      return;
    }

    trackPurchase({
      planId,
      transactionId: data.transactionId ?? sessionId,
      value: data.value,
      currency: data.currency,
      subscriptionId: data.subscriptionId,
    });
  } catch (error) {
    console.warn("[analytics] Falling back to plan price for purchase", error);
    if (opts.fallbackPlanId) {
      trackPurchase({
        planId: opts.fallbackPlanId,
        transactionId: sessionId,
      });
    }
  }
}
