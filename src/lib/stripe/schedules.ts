import type Stripe from "stripe";
import { isSubscriptionPlanId, type SubscriptionPlanId } from "@/lib/stripe/plans";

/** @deprecated Intro pricing removed — kept so webhook imports stay stable. */
export async function attachRegularBillingPhase(
  _subscriptionId: string,
  _planId: SubscriptionPlanId,
): Promise<void> {
  // No-op: checkout now charges the regular plan price directly.
}

export function planIdFromMetadata(
  metadata: Stripe.Metadata | null | undefined,
): SubscriptionPlanId | null {
  const plan = metadata?.plan;
  return plan && isSubscriptionPlanId(plan) ? plan : null;
}
