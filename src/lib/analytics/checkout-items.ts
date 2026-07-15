import { getPlan, type SubscriptionPlanId } from "@/lib/stripe/plans";

/** Shared ecommerce item payload for begin_checkout / purchase. */
export function planCheckoutItems(planId: SubscriptionPlanId) {
  const plan = getPlan(planId);
  return {
    currency: "CAD",
    value: plan.price,
    items: [
      {
        item_id: plan.id,
        item_name: `RedSealGuide ${plan.name}`,
        item_category: "subscription",
        item_variant: plan.id,
        price: plan.price,
        quantity: 1,
      },
    ],
  };
}
