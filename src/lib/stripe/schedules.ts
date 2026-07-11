import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/config";
import {
  getPlan,
  isSubscriptionPlanId,
  type SubscriptionPlanId,
} from "@/lib/stripe/plans";

export async function attachRegularBillingPhase(
  subscriptionId: string,
  planId: SubscriptionPlanId,
): Promise<void> {
  if (!stripe) return;

  const plan = getPlan(planId);
  if (!plan.regularPriceId || !plan.introPriceId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (subscription.metadata.regular_phase_attached === "true") return;

  const schedule = await stripe.subscriptionSchedules.create({
    from_subscription: subscriptionId,
  });

  const phaseStart = schedule.phases[0]?.start_date ?? subscription.start_date;

  await stripe.subscriptionSchedules.update(schedule.id, {
    end_behavior: "release",
    phases: [
      {
        items: [{ price: plan.introPriceId, quantity: 1 }],
        duration: { interval: "week", interval_count: 1 },
        start_date: phaseStart,
      },
      {
        items: [{ price: plan.regularPriceId, quantity: 1 }],
      },
    ],
    metadata: { plan: planId },
  });

  await stripe.subscriptions.update(subscriptionId, {
    metadata: {
      ...subscription.metadata,
      plan: planId,
      regular_phase_attached: "true",
    },
  });
}

export function planIdFromMetadata(
  metadata: Stripe.Metadata | null | undefined,
): SubscriptionPlanId | null {
  const plan = metadata?.plan;
  return plan && isSubscriptionPlanId(plan) ? plan : null;
}
