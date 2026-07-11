"use client";

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Lock, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StripeCheckoutPanel } from "@/components/subscription/stripe-checkout-panel";
import {
  isSubscriptionPlanId,
  type SubscriptionPlanId,
} from "@/lib/stripe/plans";
import { UPGRADE_PLANS } from "@/components/subscription/upgrade-plans";

type UpgradeContextValue = {
  openUpgrade: () => void;
};

const UpgradeContext = createContext<UpgradeContextValue | null>(null);

const UPGRADE_FEATURES = [
  "All lessons & learning paths",
  "Unlimited mock exams",
  "Full flashcard deck",
  "Unlimited practice questions",
  "Unlimited word translations",
];

type ModalStep = "plans" | "checkout" | "success";

function UpgradeModal({
  open,
  onClose,
  step,
  selectedPlan,
  onSelectPlan,
  onBackToPlans,
  onCheckoutSuccess,
}: {
  open: boolean;
  onClose: () => void;
  step: ModalStep;
  selectedPlan: SubscriptionPlanId | null;
  onSelectPlan: (planId: SubscriptionPlanId) => void;
  onBackToPlans: () => void;
  onCheckoutSuccess: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2A37]/50 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[min(92vh,820px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
      >
        <div className="flex items-start justify-between border-b border-[#ECE6DC] px-5 py-4 sm:px-6">
          <div>
            {step === "checkout" && (
              <button
                type="button"
                onClick={onBackToPlans}
                className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-[#64748B] hover:text-[#1F2A37]"
              >
                <ArrowLeft className="h-4 w-4" />
                All plans
              </button>
            )}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#D8232A]">
              <Lock className="h-3.5 w-3.5" />
              Upgrade
            </div>
            <h2
              id="upgrade-modal-title"
              className="mt-1 font-[family-name:var(--font-barlow-semi)] text-xl font-bold text-[#1F2A37] sm:text-2xl"
            >
              {step === "success"
                ? "You're subscribed!"
                : step === "checkout"
                  ? "Complete your subscription"
                  : "Unlock full access"}
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">
              {step === "success"
                ? "Your intro week is active. All content is now unlocked."
                : step === "checkout"
                  ? "Enter your payment details below."
                  : "Pick a plan and start your discounted intro week."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#64748B] hover:bg-[#F3EFE8]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          {step === "plans" && (
            <>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FCEBEC] px-3 py-1.5 text-xs font-bold text-[#B6291F]">
                <Tag className="h-3.5 w-3.5" />
                Discounted first week · 24h refund · cancel anytime
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {UPGRADE_PLANS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => onSelectPlan(plan.id)}
                    className={`relative flex flex-col rounded-xl border p-4 text-left transition hover:shadow-md ${
                      plan.popular
                        ? "border-[#C0271E] bg-gradient-to-br from-[#FFF5F5] to-white shadow-sm"
                        : "border-[#E5E0D8] bg-white hover:border-[#C0271E]/40"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute right-2 top-2 rounded-md bg-[#C0271E] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                        Popular
                      </span>
                    )}
                    <span className="font-[family-name:var(--font-barlow-semi)] text-xs font-bold uppercase tracking-wide text-[#C0271E]">
                      {plan.name}
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold text-[#1F2A37]">
                        {plan.price}
                      </span>
                      <span className="text-xs font-semibold text-[#94A3B8]">
                        {plan.per}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#64748B]">{plan.sub}</p>
                    <span className="mt-3 inline-flex h-9 items-center justify-center rounded-[10px] bg-[#C0271E] px-3 text-sm font-bold text-white">
                      {plan.cta}
                    </span>
                  </button>
                ))}
              </div>

              <ul className="mt-5 space-y-2">
                {UPGRADE_FEATURES.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-[#334155]"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === "checkout" && selectedPlan && (
            <StripeCheckoutPanel
              planId={selectedPlan}
              onSuccess={onCheckoutSuccess}
            />
          )}

          {step === "success" && (
            <div className="py-6 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#ECFDF5] text-[#059669]">
                <Check className="h-7 w-7" />
              </div>
              <p className="mt-4 text-[#334155]">
                You now have full access to lessons, mock exams, and flashcards.
              </p>
              <Button className="mt-6" onClick={onClose}>
                Continue studying
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UpgradeProviderInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>("plans");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanId | null>(
    null,
  );

  const resetModal = useCallback(() => {
    setStep("plans");
    setSelectedPlan(null);
  }, []);

  const openUpgrade = useCallback(() => {
    resetModal();
    setModalOpen(true);
  }, [resetModal]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    resetModal();
  }, [resetModal]);

  const handleSelectPlan = useCallback((planId: SubscriptionPlanId) => {
    setSelectedPlan(planId);
    setStep("checkout");
  }, []);

  const handleCheckoutSuccess = useCallback(() => {
    setStep("success");
    router.refresh();
  }, [router]);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const plan = searchParams.get("plan");
    if (checkout === "success" && plan && isSubscriptionPlanId(plan)) {
      setSelectedPlan(plan);
      setStep("success");
      setModalOpen(true);
    }
  }, [searchParams]);

  const value = useMemo(() => ({ openUpgrade }), [openUpgrade]);

  return (
    <UpgradeContext.Provider value={value}>
      {children}
      <UpgradeModal
        open={modalOpen}
        onClose={closeModal}
        step={step}
        selectedPlan={selectedPlan}
        onSelectPlan={handleSelectPlan}
        onBackToPlans={() => setStep("plans")}
        onCheckoutSuccess={handleCheckoutSuccess}
      />
    </UpgradeContext.Provider>
  );
}

export function UpgradeProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <UpgradeProviderInner>{children}</UpgradeProviderInner>
    </Suspense>
  );
}

export function useUpgrade(): UpgradeContextValue {
  const ctx = useContext(UpgradeContext);
  if (!ctx) {
    throw new Error("useUpgrade must be used within UpgradeProvider");
  }
  return ctx;
}
