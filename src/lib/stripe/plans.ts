export type SubscriptionPlanId = "weekly" | "monthly" | "quarterly";

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  introPrice: number;
  regularPrice: number;
  introLabel: string;
  regularLabel: string;
  /** First-week intro price (always weekly interval). */
  introPriceId: string | undefined;
  /** Regular recurring price after the intro week. */
  regularPriceId: string | undefined;
};

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlan> = {
  weekly: {
    id: "weekly",
    name: "Weekly",
    introPrice: 9.99,
    regularPrice: 19.99,
    introLabel: "$9.99 first week",
    regularLabel: "then $19.99 / week",
    introPriceId: process.env.STRIPE_WEEKLY_INTRO_PRICE_ID,
    regularPriceId: process.env.STRIPE_WEEKLY_PRICE_ID,
  },
  monthly: {
    id: "monthly",
    name: "Monthly",
    introPrice: 7.99,
    regularPrice: 59.99,
    introLabel: "$7.99 first week",
    regularLabel: "then $59.99 / month",
    introPriceId: process.env.STRIPE_MONTHLY_INTRO_PRICE_ID,
    regularPriceId: process.env.STRIPE_MONTHLY_PRICE_ID,
  },
  quarterly: {
    id: "quarterly",
    name: "Quarterly",
    introPrice: 5.99,
    regularPrice: 99.99,
    introLabel: "$5.99 first week",
    regularLabel: "then $99.99 / quarter",
    introPriceId: process.env.STRIPE_QUARTERLY_INTRO_PRICE_ID,
    regularPriceId: process.env.STRIPE_QUARTERLY_PRICE_ID,
  },
};

export const REFUND_WINDOW_MS = 24 * 60 * 60 * 1000;
export const INTRO_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

export function isSubscriptionPlanId(value: string): value is SubscriptionPlanId {
  return value === "weekly" || value === "monthly" || value === "quarterly";
}

export function getPlan(id: SubscriptionPlanId): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[id];
}

export function planHasStripeConfig(plan: SubscriptionPlan): boolean {
  return Boolean(plan.introPriceId && plan.regularPriceId);
}
