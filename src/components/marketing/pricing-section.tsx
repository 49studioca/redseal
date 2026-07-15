"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Check, Tag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutDrawer } from "@/components/marketing/checkout-drawer";
import {
  isSubscriptionPlanId,
  type SubscriptionPlanId,
} from "@/lib/stripe/plans";
import { planCheckoutItems } from "@/lib/analytics/checkout-items";
import { flushPendingAuthEvent, trackEvent } from "@/lib/analytics/track-event";
import { TRADES } from "@/data/seed";
import { cn } from "@/lib/utils";

const ACTIVE_TRADE_COUNT = TRADES.filter(
  (trade) => trade.status === "live",
).length;

const sharedFeatures: ReactNode[] = [
  `All ${ACTIVE_TRADE_COUNT} active trade libraries`,
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
    id: "monthly" as const,
    name: "Monthly",
    accent: "text-[#C0271E]",
    price: "$59.99",
    per: "/ month",
    sub: "Flexible month-to-month",
    compareAt: null as string | null,
    save: null as string | null,
    equiv: null as string | null,
    cta: "Get Monthly",
    popular: false,
    dark: false,
  },
  {
    id: "quarterly" as const,
    name: "Exam Prep",
    accent: "text-white",
    price: "$99.99",
    per: "/ 3 months",
    sub: "One exam cycle of access",
    compareAt: "$179.97",
    save: "Save 44%",
    equiv: "That's $33 / mo",
    cta: "Get Exam Prep",
    popular: true,
    dark: true,
  },
  {
    id: "annual" as const,
    name: "Annual",
    accent: "text-[#C0271E]",
    price: "$199.99",
    per: "/ year",
    sub: "For long prep or multiple trades",
    compareAt: "$719.88",
    save: "Save 72%",
    equiv: "$17 / mo",
    cta: "Get Annual",
    popular: false,
    dark: false,
  },
];

function PricingSectionInner({
  defaultTradeSlug = null,
}: {
  defaultTradeSlug?: string | null;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pathTradeSlug = pathname?.startsWith("/trades/")
    ? pathname.split("/")[2] || null
    : null;
  const resolvedTradeSlug =
    defaultTradeSlug ||
    (pathTradeSlug && TRADES.some((trade) => trade.slug === pathTradeSlug)
      ? pathTradeSlug
      : null);

  const openCheckout = useCallback((planId: SubscriptionPlanId) => {
    trackEvent("begin_checkout", {
      ...planCheckoutItems(planId),
      plan_id: planId,
      source: "pricing",
    });
    setSelectedPlan(planId);
    setDrawerOpen(true);
  }, []);

  useEffect(() => {
    flushPendingAuthEvent();
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

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        id="pricing"
        className="border-y border-[#E5E0D8] bg-[#F6F3EE]"
      >
        <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 sm:py-[78px]">
          <div
            className={cn(
              "pricing-reveal relative z-30 mx-auto max-w-[600px] text-center",
              visible && "is-visible",
            )}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#D8232A] sm:text-[13px]">
              Pricing
            </div>
            <h2 className="mt-2.5 font-[family-name:var(--font-barlow-condensed)] text-[32px] font-bold leading-none tracking-tight sm:text-[40px] md:text-[46px]">
              Pick the study window that fits your exam date
            </h2>
            <p className="mt-3 text-sm text-[#64748B] sm:text-[17px]">
              Start free, see how the lessons work, then upgrade only if the
              full practice library is right for you.
            </p>
            <div className="mt-4 inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-full bg-[#FCEBEC] px-3 py-1.5 text-[11px] font-bold text-[#B6291F] sm:mt-5 sm:gap-2 sm:px-[15px] sm:py-[7px] sm:text-[13.5px]">
              <Tag className="h-3.5 w-3.5 sm:h-[15px] sm:w-[15px]" />
              Free to try · cancel anytime ·{" "}
              <span className="group relative z-40 inline-flex">
                <button
                  type="button"
                  aria-describedby="pricing-refund-tooltip"
                  className="cursor-help underline decoration-dotted underline-offset-2"
                >
                  24-hour refund policy
                </button>
                <span
                  id="pricing-refund-tooltip"
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-xl bg-[#1F2A37] px-3.5 py-3 text-left text-xs font-medium leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                >
                  Request a full refund within 24 hours of starting your plan.
                  After that window, payments are non-refundable. Approved
                  refunds usually appear in 5–10 business days.
                </span>
              </span>
            </div>
          </div>

          <div className="mt-8 grid items-stretch gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3 md:items-end">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={cn(
                  "pricing-reveal pricing-card relative flex flex-col rounded-[18px] p-5 sm:p-7",
                  `pricing-reveal-delay-${index + 1}`,
                  visible && "is-visible",
                  plan.dark
                    ? "pricing-card-popular z-[1] border-[1.5px] border-white/40 bg-gradient-to-br from-[#E0392F] to-[#C2151B] text-white md:-mb-2 md:min-h-[300px] md:scale-[1.03]"
                    : "min-h-[260px] border border-[#E5E0D8] bg-white text-[#1F2A37] shadow-sm hover:border-[#C0271E]/35 hover:shadow-md",
                )}
              >
                {plan.popular && (
                  <div className="pricing-badge-pulse absolute right-3 top-3 rounded-[7px] bg-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#D8232A] sm:right-4 sm:top-4 sm:px-2.5 sm:py-1 sm:text-[11px]">
                    One exam cycle
                  </div>
                )}
                <div
                  className={cn(
                    "font-[family-name:var(--font-barlow-semi)] text-xs font-bold uppercase tracking-wide sm:text-sm",
                    plan.accent,
                    plan.popular && "pr-28",
                  )}
                >
                  {plan.name}
                </div>
                <div className="mt-3 flex min-h-[22px] items-center gap-2 sm:mt-4">
                  {plan.compareAt && (
                    <>
                      <span
                        className={cn(
                          "text-sm font-semibold line-through sm:text-[15px]",
                          plan.dark ? "text-white/60" : "text-[#94A3B8]",
                        )}
                      >
                        {plan.compareAt}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide sm:text-[11px]",
                          plan.dark
                            ? "bg-[#FFD84D] text-[#7C2D12]"
                            : "border border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]",
                        )}
                      >
                        {plan.save}
                      </span>
                    </>
                  )}
                </div>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-start font-[family-name:var(--font-barlow-condensed)] font-bold leading-none",
                      plan.dark ? "text-white" : "text-[#1F2A37]",
                    )}
                  >
                    <span className="text-[40px] sm:text-[50px]">
                      {plan.price.split(".")[0]}
                    </span>
                    <span className="mt-1 text-[18px] leading-none sm:mt-1.5 sm:text-[22px]">
                      .{plan.price.split(".")[1]}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold sm:text-[15px]",
                      plan.dark ? "text-[#FCE3E4]" : "text-[#94A3B8]",
                    )}
                  >
                    CAD {plan.per}
                  </span>
                </div>
                <div className="mt-2 min-h-[2.5rem] space-y-1.5">
                  <p
                    className={cn(
                      "text-xs leading-snug sm:text-[13.5px]",
                      plan.dark ? "text-[#FCE3E4]" : "text-[#94A3B8]",
                    )}
                  >
                    {plan.sub}
                  </p>
                  {plan.equiv && (
                    <p
                      className={cn(
                        "text-xs font-semibold sm:text-[13px]",
                        plan.dark ? "text-white" : "text-[#059669]",
                      )}
                    >
                      {plan.equiv}
                    </p>
                  )}
                </div>
                <div className="mt-auto pt-6">
                  <Button
                    type="button"
                    variant={plan.dark ? "white" : "secondary"}
                    size="lg"
                    className={cn(
                      "h-11 w-full rounded-[12px] text-[14px] font-extrabold sm:h-[48px] sm:text-[15px]",
                      plan.dark
                        ? "shadow-[0_8px_20px_rgba(0,0,0,0.18)] hover:shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
                        : "bg-white",
                    )}
                    onClick={() => openCheckout(plan.id)}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "pricing-reveal pricing-reveal-delay-4 mx-auto mt-8 max-w-[760px] rounded-[18px] border border-[#E5E0D8] bg-white p-5 sm:mt-10 sm:p-7",
              visible && "is-visible",
            )}
          >
            <div className="text-center font-[family-name:var(--font-barlow-semi)] text-sm font-bold uppercase tracking-wide text-[#1F2A37] sm:text-base">
              Every paid plan includes
            </div>
            <div className="mt-4 grid gap-2.5 sm:mt-5 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-3">
              {sharedFeatures.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-[#334155] sm:text-sm"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#059669] sm:h-4 sm:w-4" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CheckoutDrawer
        planId={selectedPlan}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        defaultTradeSlug={resolvedTradeSlug}
      />
    </>
  );
}

export function PricingSection({
  defaultTradeSlug = null,
}: {
  defaultTradeSlug?: string | null;
} = {}) {
  return (
    <Suspense fallback={null}>
      <PricingSectionInner defaultTradeSlug={defaultTradeSlug} />
    </Suspense>
  );
}
