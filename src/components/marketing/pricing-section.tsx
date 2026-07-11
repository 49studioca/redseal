"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { Check, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutDrawer } from "@/components/marketing/checkout-drawer";
import {
  isSubscriptionPlanId,
  type SubscriptionPlanId,
} from "@/lib/stripe/plans";

const sharedFeatures: ReactNode[] = [
  "All 56 Red Seal trades",
  "Unlimited AI quizzes",
  "Unlimited mock exams",
  "Weak-spot targeting",
  "Code-referenced answers",
  <>
    <span className="sm:hidden">
      Click to <b>translate</b> words
    </span>
    <span className="hidden sm:inline">
      Click any word to <b>translate</b> lesson content
    </span>
  </>,
  "Cancel anytime",
];

const plans = [
  {
    id: "weekly" as const,
    name: "Weekly",
    accent: "text-[#C0271E]",
    price: "$9.99",
    per: "first week",
    sub: "then $19.99 / week",
    cta: "Start for $9.99",
    popular: false,
    dark: false,
  },
  {
    id: "monthly" as const,
    name: "Monthly",
    accent: "text-white",
    price: "$7.99",
    per: "first week",
    sub: "then $59.99 / month",
    cta: "Start for $7.99",
    popular: true,
    dark: true,
  },
  {
    id: "quarterly" as const,
    name: "Quarterly",
    accent: "text-[#C0271E]",
    price: "$5.99",
    per: "first week",
    sub: "then $99.99 / quarter",
    cta: "Start for $5.99",
    popular: false,
    dark: false,
  },
];

function PricingSectionInner() {
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openCheckout = useCallback((planId: SubscriptionPlanId) => {
    setSelectedPlan(planId);
    setDrawerOpen(true);
  }, []);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const plan = searchParams.get("plan");
    if (checkout === "resume" && plan && isSubscriptionPlanId(plan)) {
      openCheckout(plan);
    }
    if (checkout === "success") {
      setDrawerOpen(true);
      if (plan && isSubscriptionPlanId(plan)) {
        setSelectedPlan(plan);
      }
    }
  }, [searchParams, openCheckout]);

  return (
    <>
      <section id="pricing" className="border-y border-[#E5E0D8] bg-[#F6F3EE]">
        <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-[78px]">
          <div className="mx-auto max-w-[600px] text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#D8232A] sm:text-[13px]">
              Pricing
            </div>
            <h2 className="mt-2.5 font-[family-name:var(--font-barlow-condensed)] text-[32px] font-bold leading-none tracking-tight sm:text-[40px] md:text-[46px]">
              Cheaper than rewriting the exam
            </h2>
            <p className="mt-3 text-sm text-[#64748B] sm:text-[17px]">
              A re-test costs hundreds and weeks of your time. Try any plan for
              your first week, then keep going — or cancel.
            </p>
            <div className="mt-4 inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full bg-[#FCEBEC] px-3 py-1.5 text-[11px] font-bold text-[#B6291F] sm:mt-5 sm:gap-2 sm:px-[15px] sm:py-[7px] sm:text-[13.5px]">
              <Tag className="h-3.5 w-3.5 sm:h-[15px] sm:w-[15px]" />
              <span className="sm:hidden">
                Discounted first week · 24h refund · cancel anytime
              </span>
              <span className="hidden sm:inline">
                Every plan: discounted first week · 24h refund · cancel anytime
              </span>
            </div>
          </div>

          <div className="mt-6 grid items-stretch gap-3 sm:mt-10 sm:gap-[18px] md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-[18px] p-5 sm:p-7 ${
                  plan.dark
                    ? "border-[1.5px] border-white/40 bg-gradient-to-br from-[#E0392F] to-[#C2151B] text-white shadow-[0_18px_40px_rgba(216,35,42,0.32)]"
                    : "border border-[#E5E0D8] bg-white text-[#1F2A37] shadow-sm"
                }`}
              >
                {plan.popular && (
                  <div className="absolute right-3 top-3 rounded-[7px] bg-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#D8232A] sm:right-4 sm:top-4 sm:px-2.5 sm:py-1 sm:text-[11px]">
                    Most popular
                  </div>
                )}
                <div
                  className={`font-[family-name:var(--font-barlow-semi)] text-xs font-bold uppercase tracking-wide sm:text-sm ${plan.accent}`}
                >
                  {plan.name}
                </div>
                <div className="mt-2.5 flex items-baseline gap-1 sm:mt-3.5">
                  <span
                    className={`font-[family-name:var(--font-barlow-condensed)] text-[40px] font-bold leading-[0.9] sm:text-[50px] ${plan.dark ? "text-white" : "text-[#1F2A37]"}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm font-semibold sm:text-[15px] ${plan.dark ? "text-[#FCE3E4]" : "text-[#94A3B8]"}`}
                  >
                    {plan.per}
                  </span>
                </div>
                <div
                  className={`mt-1 text-xs sm:mt-1.5 sm:text-[13.5px] ${plan.dark ? "text-[#FCE3E4]" : "text-[#94A3B8]"}`}
                >
                  {plan.sub}
                </div>
                <Button
                  type="button"
                  variant={plan.dark ? "white" : "dark"}
                  className="mt-4 h-10 w-full rounded-[11px] text-sm font-extrabold sm:mt-5 sm:h-[46px] sm:text-[15px]"
                  onClick={() => openCheckout(plan.id)}
                >
                  {plan.cta}
                </Button>
                <div
                  className={`my-4 h-px sm:my-5 ${plan.dark ? "bg-white/10" : "bg-[#ECE6DC]"}`}
                />
                <div className="flex flex-col gap-2 sm:gap-[11px]">
                  {sharedFeatures.map((f, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 text-xs sm:text-sm ${plan.dark ? "text-[#FCE3E4]" : "text-[#334155]"}`}
                    >
                      <Check
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 ${plan.dark ? "text-white" : "text-[#059669]"}`}
                      />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CheckoutDrawer
        planId={selectedPlan}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}

export function PricingSection() {
  return (
    <Suspense fallback={null}>
      <PricingSectionInner />
    </Suspense>
  );
}
