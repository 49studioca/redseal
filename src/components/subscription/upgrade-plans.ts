import type { SubscriptionPlanId } from "@/lib/stripe/plans";

export type UpgradePlanCard = {
  id: SubscriptionPlanId;
  name: string;
  price: string;
  per: string;
  sub: string;
  cta: string;
  popular: boolean;
};

export const UPGRADE_PLANS: UpgradePlanCard[] = [
  {
    id: "weekly",
    name: "Weekly",
    price: "$9.99",
    per: "first week",
    sub: "then $19.99 / week",
    cta: "Start for $9.99",
    popular: false,
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "$7.99",
    per: "first week",
    sub: "then $59.99 / month",
    cta: "Start for $7.99",
    popular: true,
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: "$5.99",
    per: "first week",
    sub: "then $99.99 / quarter",
    cta: "Start for $5.99",
    popular: false,
  },
];
