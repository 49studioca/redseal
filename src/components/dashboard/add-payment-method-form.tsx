"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type AddPaymentMethodFormProps = {
  onSuccess: () => void;
  onCancel: () => void;
};

function SetupForm({ onSuccess, onCancel }: AddPaymentMethodFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setBusy(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Check your card details");
      setBusy(false);
      return;
    }

    const returnUrl = `${window.location.origin}/dashboard/billing?pm=added`;
    const { error: confirmError } = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Could not save card");
      setBusy(false);
      return;
    }

    onSuccess();
    setBusy(false);
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      {error && <p className="text-sm text-[#B91C1C]">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={!stripe || busy}>
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            "Save card"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AddPaymentMethodForm({
  onSuccess,
  onCancel,
}: AddPaymentMethodFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const startSetup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/billing/setup-intent", {
        method: "POST",
      });
      const data = (await res.json()) as {
        clientSecret?: string | null;
        demo?: boolean;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Could not start card setup");
      }
      if (data.demo || !data.clientSecret) {
        throw new Error(
          data.message ??
            "Stripe is not configured — card setup needs live keys.",
        );
      }
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not start card setup",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void startSetup();
  }, [startSetup]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-[#64748B]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Preparing secure card form…
      </div>
    );
  }

  if (error || !clientSecret || !stripePromise) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[#B91C1C]">
          {error ?? "Stripe publishable key is missing"}
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#C0271E",
            borderRadius: "10px",
            fontFamily: "Barlow, system-ui, sans-serif",
          },
        },
      }}
    >
      <SetupForm onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}
