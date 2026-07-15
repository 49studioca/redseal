import type { SubscriptionPlanId } from "@/lib/stripe/plans";

export type UpgradePlanCard = {
  id: SubscriptionPlanId;
  name: string;
  price: string;
  per: string;
  sub: string;
  cta: string;
  popular: boolean;
  badge?: string;
};

export const UPGRADE_PLANS: UpgradePlanCard[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: "$59.99",
    per: "CAD / month",
    sub: "Flexible · cancel anytime",
    cta: "Choose Monthly",
    popular: false,
  },
  {
    id: "quarterly",
    name: "Exam Prep",
    price: "$99.99",
    per: "CAD / 3 months",
    sub: "$33/mo · Save 44% vs monthly",
    cta: "Choose Exam Prep",
    popular: true,
    badge: "Save 44%",
  },
  {
    id: "annual",
    name: "Annual",
    price: "$199.99",
    per: "CAD / year",
    sub: "$17/mo · Save 72% vs monthly",
    cta: "Choose Annual",
    popular: false,
    badge: "Save 72%",
  },
];
