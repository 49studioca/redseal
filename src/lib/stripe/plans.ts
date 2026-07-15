export type SubscriptionPlanId = "monthly" | "quarterly" | "annual";

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  /** Short marketing name shown on cards. */
  displayName: string;
  price: number;
  /** Effective monthly rate (for comparison). */
  monthlyEquivalent: number;
  /** Percent saved vs paying monthly at list price. */
  savingsPercent: number | null;
  priceLabel: string;
  periodLabel: string;
  /** e.g. "billed monthly" / "billed every 3 months" / "billed yearly" */
  billingNote: string;
  priceId: string | undefined;
};

/**
 * Decoy ladder tuned so Exam Prep wins for most buyers:
 * - Monthly anchors a high $/mo (rarely chosen)
 * - Exam Prep matches one exam cycle + strong savings vs monthly
 * - Annual is the best $/mo for year-long or multi-trade prep
 */
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlan> = {
  monthly: {
    id: "monthly",
    name: "Monthly",
    displayName: "Monthly",
    price: 59.99,
    monthlyEquivalent: 59.99,
    savingsPercent: null,
    priceLabel: "$59.99",
    periodLabel: "/ month",
    billingNote: "billed monthly",
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID,
  },
  quarterly: {
    id: "quarterly",
    name: "3-Month",
    displayName: "Exam Prep",
    price: 99.99,
    monthlyEquivalent: 33.33,
    savingsPercent: 44,
    priceLabel: "$99.99",
    periodLabel: "/ 3 months",
    billingNote: "billed every 3 months",
    priceId: process.env.STRIPE_QUARTERLY_PRICE_ID,
  },
  annual: {
    id: "annual",
    name: "Annual",
    displayName: "Annual",
    price: 199.99,
    monthlyEquivalent: 16.67,
    savingsPercent: 72,
    priceLabel: "$199.99",
    periodLabel: "/ year",
    billingNote: "billed yearly",
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID,
  },
};

export const REFUND_WINDOW_MS = 24 * 60 * 60 * 1000;

export function isSubscriptionPlanId(value: string): value is SubscriptionPlanId {
  return value === "monthly" || value === "quarterly" || value === "annual";
}

export function getPlan(id: SubscriptionPlanId): SubscriptionPlan {
  return SUBSCRIPTION_PLANS[id];
}

export function planHasStripeConfig(plan: SubscriptionPlan): boolean {
  return Boolean(plan.priceId);
}
