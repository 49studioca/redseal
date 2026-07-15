"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Heart,
  Loader2,
  Sparkles,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CANCEL_REASONS,
  type CancelReasonId,
  type BillingSubscription,
} from "@/lib/stripe/billing-types";
import { trackEvent } from "@/lib/analytics/track-event";

type CancelFlowProps = {
  open: boolean;
  subscription: BillingSubscription;
  onClose: () => void;
  onCanceled: (
    subscription: BillingSubscription,
    accessUntil: number | null,
  ) => void;
  onKept: (subscription: BillingSubscription) => void;
  onFixPayment: () => void;
};

type Step = "pause" | "why" | "offer" | "feedback" | "confirm" | "done";

function formatAccessDate(unix: number | null): string {
  if (!unix) return "the end of your billing period";
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function CancelSubscriptionFlow({
  open,
  subscription,
  onClose,
  onCanceled,
  onKept,
  onFixPayment,
}: CancelFlowProps) {
  const [step, setStep] = useState<Step>("pause");
  const [reason, setReason] = useState<CancelReasonId | null>(null);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessUntil, setAccessUntil] = useState<number | null>(
    subscription.currentPeriodEnd,
  );

  if (!open) return null;

  const resetAndClose = () => {
    setStep("pause");
    setReason(null);
    setFeedback("");
    setError(null);
    setBusy(false);
    onClose();
  };

  const acceptOffer = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept_offer" }),
      });
      const data = (await res.json()) as {
        error?: string;
        subscription?: BillingSubscription;
      };
      if (!res.ok) throw new Error(data.error ?? "Could not apply offer");
      trackEvent("retain_subscription", {
        plan_name: subscription.planName ?? undefined,
        plan_interval: subscription.planInterval ?? undefined,
        reason: reason ?? undefined,
      });
      if (data.subscription) onKept(data.subscription);
      resetAndClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not apply offer");
    } finally {
      setBusy(false);
    }
  };

  const confirmCancel = async () => {
    if (!reason) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          reason,
          feedback: feedback.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        accessUntil?: number | null;
        subscription?: BillingSubscription;
      };
      if (!res.ok) throw new Error(data.error ?? "Could not cancel");
      const until = data.accessUntil ?? subscription.currentPeriodEnd;
      setAccessUntil(until);
      trackEvent("cancel_subscription", {
        plan_name: subscription.planName ?? undefined,
        plan_interval: subscription.planInterval ?? undefined,
        reason,
      });
      if (data.subscription) onCanceled(data.subscription, until);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel");
    } finally {
      setBusy(false);
    }
  };

  const offerCopy = (() => {
    switch (reason) {
      case "too_expensive":
        return {
          title: "We get it — money is tight right now",
          body: "You've already invested in your Red Seal journey. Stay with us and take 50% off your next bill — no catch, just one less thing to worry about while you study.",
          cta: "Stay & get 50% off next bill",
          secondary: "Continue canceling",
          action: "discount" as const,
        };
      case "unused":
        return {
          title: "Your progress is waiting for you",
          body: "Life gets busy. That's okay. Your lessons, practice history, and weak-area insights are still here the night before your exam — when you need them most. Stay a little longer. You've come further than you think.",
          cta: "Keep my access",
          secondary: "Continue canceling",
          action: "stay" as const,
        };
      case "payment_issues":
        return {
          title: "Let's fix payments — not your prep",
          body: "A failed charge shouldn't cost you exam readiness. Add a backup card in a minute so renewal never interrupts your study streak.",
          cta: "Add a backup card",
          secondary: "Continue canceling",
          action: "payment" as const,
        };
      case "passed_exam":
        return {
          title: "We're proud of you",
          body: "Passing your Red Seal is huge. If you're done studying, we understand — and you can still keep access through the period you've already paid for. If a friend or coworker still needs prep, your support helped build this for trades like yours.",
          cta: "Keep access a little longer",
          secondary: "Continue canceling",
          action: "stay" as const,
        };
      case "missing_features":
        return {
          title: "Tell us what would keep you",
          body: "We're building this for apprentices and journeypersons like you. Stick around, and your next bill is 50% off while we keep improving practice, videos, and exam readiness tools.",
          cta: "Stay & get 50% off",
          secondary: "Continue canceling",
          action: "discount" as const,
        };
      default:
        return {
          title: "We'll miss studying with you",
          body: "Whatever brought you here — we hope RedSealGuide made your path a little clearer. Before you go, take 50% off your next bill and keep every lesson unlocked.",
          cta: "Stay & get 50% off",
          secondary: "Continue canceling",
          action: "discount" as const,
        };
    }
  })();

  const handleOfferPrimary = async () => {
    if (offerCopy.action === "discount") {
      await acceptOffer();
      return;
    }
    if (offerCopy.action === "payment") {
      resetAndClose();
      onFixPayment();
      return;
    }
    resetAndClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[#1F2A37]/55 backdrop-blur-[2px]"
        aria-label="Close cancel flow"
        onClick={resetAndClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-[#E5E0D8] bg-[#FBF9F6] shadow-2xl sm:rounded-2xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-[#E5E0D8] bg-[#FBF9F6]/95 px-4 py-3 backdrop-blur sm:px-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1F2A37]">
            <Heart className="h-4 w-4 text-[#C0271E]" />
            Before you go
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F3EFE8]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-5 sm:px-5">
          {step === "pause" && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl bg-gradient-to-br from-[#1F2A37] to-[#2C3A4A] p-5 text-white">
                <Sparkles className="h-5 w-5 text-[#F4A11A]" />
                <h2 className="mt-3 font-[family-name:var(--font-barlow-semi)] text-2xl font-bold leading-tight">
                  Your Red Seal story isn&apos;t finished yet
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#C5D2DE]">
                  Every practice session, mock exam, and lesson you unlocked is
                  part of getting you exam-ready. Leaving now means pausing that
                  momentum — and momentum is hard to rebuild the week before
                  test day.
                </p>
              </div>
              <p className="text-sm text-[#64748B]">
                If you cancel, you keep full access until{" "}
                <span className="font-semibold text-[#1F2A37]">
                  {formatAccessDate(subscription.currentPeriodEnd)}
                </span>
                . We&apos;ll stop your next payment — no surprise charges.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button className="flex-1" onClick={resetAndClose}>
                  Keep studying with me
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setStep("why")}
                >
                  I still want to cancel
                </Button>
              </div>
            </div>
          )}

          {step === "why" && (
            <div className="space-y-4">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#1F2A37]"
                onClick={() => setStep("pause")}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <h2 className="font-[family-name:var(--font-barlow-semi)] text-xl font-bold text-[#1F2A37]">
                What made you want to leave?
              </h2>
              <p className="text-sm text-[#64748B]">
                Be honest — this helps us support people walking the same path
                as you.
              </p>
              <div className="grid gap-2">
                {CANCEL_REASONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setReason(item.id);
                      setStep("offer");
                    }}
                    className="rounded-xl border border-[#E5E0D8] bg-white px-4 py-3 text-left text-sm font-semibold text-[#1F2A37] transition hover:border-[#C0271E]/40 hover:bg-[#FDF8F6]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "offer" && (
            <div className="space-y-4">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#1F2A37]"
                onClick={() => setStep("why")}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <div className="rounded-xl border border-[#F4A11A]/35 bg-gradient-to-br from-[#FFF8EC] to-white p-5">
                <ShieldCheck className="h-5 w-5 text-[#C0271E]" />
                <h2 className="mt-3 font-[family-name:var(--font-barlow-semi)] text-xl font-bold text-[#1F2A37]">
                  {offerCopy.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                  {offerCopy.body}
                </p>
              </div>
              {error && <p className="text-sm text-[#B91C1C]">{error}</p>}
              <div className="flex flex-col gap-2">
                <Button
                  disabled={busy}
                  onClick={() => void handleOfferPrimary()}
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Working…
                    </>
                  ) : (
                    offerCopy.cta
                  )}
                </Button>
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() => setStep("feedback")}
                >
                  {offerCopy.secondary}
                </Button>
              </div>
            </div>
          )}

          {step === "feedback" && (
            <div className="space-y-4">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#1F2A37]"
                onClick={() => setStep("offer")}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <h2 className="font-[family-name:var(--font-barlow-semi)] text-xl font-bold text-[#1F2A37]">
                One last thing — what could we have done better?
              </h2>
              <p className="text-sm text-[#64748B]">
                Your words go straight to the people building RedSealGuide.
                Optional, but it means a lot.
              </p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="Share anything that would have kept you learning…"
                className="w-full rounded-xl border border-[#E5E0D8] bg-white px-3 py-2.5 text-sm text-[#1F2A37] outline-none ring-[#C0271E]/30 placeholder:text-[#94A3B8] focus:ring-2"
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  className="flex-1"
                  variant="secondary"
                  onClick={() => setStep("confirm")}
                >
                  Continue
                </Button>
                <Button
                  className="flex-1"
                  variant="ghost"
                  onClick={resetAndClose}
                >
                  Never mind — I&apos;ll stay
                </Button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#1F2A37]"
                onClick={() => setStep("feedback")}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <h2 className="font-[family-name:var(--font-barlow-semi)] text-xl font-bold text-[#1F2A37]">
                Cancel your next payment?
              </h2>
              <div className="rounded-xl border border-[#E5E0D8] bg-white p-4 text-sm text-[#475569]">
                <p>
                  We&apos;ll cancel upcoming charges. You keep full Pro access
                  until{" "}
                  <span className="font-semibold text-[#1F2A37]">
                    {formatAccessDate(subscription.currentPeriodEnd)}
                  </span>
                  .
                </p>
                <p className="mt-2">
                  After that, your account stays free — lessons and practice
                  limits apply.
                </p>
              </div>
              {error && <p className="text-sm text-[#B91C1C]">{error}</p>}
              <div className="flex flex-col gap-2">
                <Button
                  disabled={busy}
                  className="bg-gradient-to-br from-[#DC2626] to-[#B91C1C] shadow-none"
                  onClick={() => void confirmCancel()}
                >
                  {busy ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Canceling next payment…
                    </>
                  ) : (
                    "Cancel next payment"
                  )}
                </Button>
                <Button variant="ghost" disabled={busy} onClick={resetAndClose}>
                  Keep my subscription
                </Button>
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF2F2]">
                <Heart className="h-6 w-6 text-[#C0271E]" />
              </div>
              <h2 className="font-[family-name:var(--font-barlow-semi)] text-xl font-bold text-[#1F2A37]">
                You&apos;re all set — and the door stays open
              </h2>
              <p className="text-sm leading-relaxed text-[#64748B]">
                Next payment canceled. Keep using everything until{" "}
                <span className="font-semibold text-[#1F2A37]">
                  {formatAccessDate(accessUntil)}
                </span>
                . If exam day gets close and you want Pro back, you can
                reactivate anytime before then.
              </p>
              <p className="text-sm text-[#64748B]">
                Thank you for trusting us with your prep. We&apos;re rooting for
                you.
              </p>
              <Button onClick={resetAndClose}>Back to billing</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
