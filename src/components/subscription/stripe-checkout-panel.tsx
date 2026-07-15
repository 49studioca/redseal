"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { getPlan, type SubscriptionPlanId } from "@/lib/stripe/plans";
import { trackPurchaseFromSession } from "@/lib/analytics/track-purchase";
import { Button } from "@/components/ui/button";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

async function readJsonResponse(res: Response) {
  const text = await res.text();
  if (!text) {
    throw new Error("Checkout service returned an empty response");
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error("Checkout service returned an invalid response");
  }
}

type StripeCheckoutPanelProps = {
  planId: SubscriptionPlanId;
  onSuccess: () => void;
};

export function StripeCheckoutPanel({
  planId,
  onSuccess,
}: StripeCheckoutPanelProps) {
  const router = useRouter();
  const plan = getPlan(planId);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startCheckout() {
      setLoading(true);
      setError(null);
      setClientSecret(null);
      setCheckoutSessionId(null);
      setDemo(false);

      try {
        const res = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
        });
        const data = await readJsonResponse(res);

        if (cancelled) return;

        if (!res.ok) {
          if (res.status === 503) {
            setDemo(true);
            return;
          }
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Could not start checkout",
          );
        }

        if (data.demo) {
          setDemo(true);
          return;
        }

        if (typeof data.clientSecret !== "string" || !data.clientSecret) {
          throw new Error("Checkout session missing client secret");
        }

        setClientSecret(data.clientSecret);
        setCheckoutSessionId(
          typeof data.sessionId === "string" ? data.sessionId : null,
        );
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Checkout failed");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void startCheckout();

    return () => {
      cancelled = true;
    };
  }, [planId]);

  const handleCheckoutComplete = useCallback(() => {
    if (checkoutSessionId) {
      void trackPurchaseFromSession({
        sessionId: checkoutSessionId,
        fallbackPlanId: planId,
      });
    }
    router.refresh();
    onSuccess();
  }, [checkoutSessionId, onSuccess, planId, router]);

  const embeddedCheckoutOptions = useMemo(
    () => ({
      clientSecret: clientSecret ?? "",
      onComplete: handleCheckoutComplete,
    }),
    [clientSecret, handleCheckoutComplete],
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[#64748B]">
        <Loader2 className="h-7 w-7 animate-spin" />
        <p className="mt-3 text-sm">Preparing secure checkout…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
        {error}
      </div>
    );
  }

  if (demo) {
    return (
      <div className="rounded-xl border border-[#E5E0D8] bg-[#F6F3EE] p-5 text-center">
        <p className="text-sm text-[#64748B]">
          Stripe is not configured yet. Add price IDs to enable payments.
        </p>
        <Button className="mt-4" onClick={onSuccess}>
          Continue
        </Button>
      </div>
    );
  }

  if (!clientSecret || !stripePromise) {
    return (
      <p className="text-sm text-[#64748B]">
        Add{" "}
        <code className="rounded bg-[#F3EFE8] px-1">
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        </code>{" "}
        to enable payments.
      </p>
    );
  }

  return (
    <div>
      <div className="rounded-xl border border-[#ECE6DC] bg-[#F6F3EE] p-4">
        <div className="flex items-baseline gap-1.5">
          <span className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold text-[#1F2A37]">
            ${plan.price.toFixed(2)}
          </span>
          <span className="text-sm font-semibold text-[#94A3B8]">
            CAD {plan.periodLabel}
          </span>
        </div>
        <p className="mt-1 text-sm text-[#64748B]">{plan.billingNote}</p>
      </div>

      <div className="mt-4">
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={embeddedCheckoutOptions}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  );
}
