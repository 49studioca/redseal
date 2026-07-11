"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getPlan, type SubscriptionPlanId } from "@/lib/stripe/plans";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppleIcon, GoogleIcon } from "@/components/auth/oauth-icons";
import { getOAuthErrorMessage } from "@/lib/auth/oauth-errors";

const DRAWER_ANIM_MS = 300;

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type Step = "auth" | "checkout" | "success";

type CheckoutDrawerProps = {
  planId: SubscriptionPlanId | null;
  open: boolean;
  onClose: () => void;
};

export function CheckoutDrawer({ planId, open, onClose }: CheckoutDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = planId ? getPlan(planId) : null;

  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [displayPlan, setDisplayPlan] = useState(plan);

  const [step, setStep] = useState<Step>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const fetchCheckoutSession = useCallback(async () => {
    if (!planId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not start checkout");
      }
      if (data.demo) {
        setStep("success");
        return;
      }
      setClientSecret(data.clientSecret);
      setStep("checkout");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }, [planId]);

  const checkAuth = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setCheckingSession(false);
      return;
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.email) {
      setEmail(user.email);
      await fetchCheckoutSession();
    }
    setCheckingSession(false);
  }, [fetchCheckoutSession]);

  useEffect(() => {
    if (open && plan) {
      setDisplayPlan(plan);
      setIsRendered(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setIsVisible(false);
    const timer = window.setTimeout(() => setIsRendered(false), DRAWER_ANIM_MS);
    return () => window.clearTimeout(timer);
  }, [open, plan]);

  useEffect(() => {
    if (!open) return;
    setStep("auth");
    setClientSecret(null);
    setError(null);
    setCheckingSession(true);
    void checkAuth();
  }, [open, planId, checkAuth]);

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      setStep("success");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isRendered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isRendered, onClose]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      await fetchCheckoutSession();
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    }

    router.refresh();
    await fetchCheckoutSession();
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    if (!isSupabaseConfigured()) {
      setError("Sign-in is not configured yet.");
      return;
    }
    const supabase = createClient();
    const origin = window.location.origin;
    const next = planId ? `/?checkout=resume&plan=${planId}` : "/";
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (oauthError)
      setError(getOAuthErrorMessage(provider, oauthError.message));
  };

  if (!isRendered || !displayPlan) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close checkout"
        className={cn(
          "fixed inset-0 z-[60] bg-[#1F2A37]/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out",
          isVisible ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-drawer-title"
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex w-full max-w-[440px] flex-col border-l border-[#E5E0D8] bg-white shadow-2xl transition-transform duration-300 ease-out will-change-transform",
          isVisible ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-[#ECE6DC] px-5 py-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#D8232A]">
              {displayPlan.name} plan
            </div>
            <h2
              id="checkout-drawer-title"
              className="font-[family-name:var(--font-barlow-semi)] text-lg font-semibold text-[#1F2A37]"
            >
              {step === "success" ? "You're in!" : "Start your intro week"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#64748B] hover:bg-[#F3EFE8]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {step !== "success" && (
            <div className="rounded-xl border border-[#ECE6DC] bg-[#F6F3EE] p-4">
              <div className="flex items-baseline gap-1.5">
                <span className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold text-[#1F2A37]">
                  ${displayPlan.introPrice.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-[#94A3B8]">
                  first week
                </span>
              </div>
              <p className="mt-1 text-sm text-[#64748B]">
                {displayPlan.regularLabel}
              </p>
              <p className="mt-2 text-xs text-[#94A3B8]">
                24-hour refund window · cancel anytime
              </p>
            </div>
          )}

          {checkingSession && (
            <div className="mt-8 flex justify-center text-[#64748B]">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {!checkingSession && step === "auth" && (
            <div className="mt-6">
              <div className="grid gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 w-full justify-center gap-2.5"
                  onClick={() => void handleOAuth("google")}
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 w-full justify-center gap-2.5"
                  onClick={() => void handleOAuth("apple")}
                >
                  <AppleIcon />
                  Continue with Apple
                </Button>
              </div>

              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#E5E0D8]" />
                <span className="text-xs text-[#94A3B8]">or email</span>
                <div className="h-px flex-1 bg-[#E5E0D8]" />
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                    autoComplete={
                      isSignUp ? "new-password" : "current-password"
                    }
                  />
                </div>
                {error && <p className="text-sm text-[#B91C1C]">{error}</p>}
                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Working…
                    </>
                  ) : isSignUp ? (
                    "Create account & continue"
                  ) : (
                    "Sign in & continue"
                  )}
                </Button>
              </form>

              <button
                type="button"
                className="mt-4 w-full text-center text-sm text-[#64748B] hover:text-[#1F2A37]"
                onClick={() => setIsSignUp((v) => !v)}
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "New here? Create an account"}
              </button>
            </div>
          )}

          {step === "checkout" && clientSecret && stripePromise && (
            <div className="mt-6">
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{
                  clientSecret,
                  onComplete: () => {
                    setStep("success");
                    router.refresh();
                  },
                }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}

          {step === "checkout" && !stripePromise && (
            <p className="mt-6 text-sm text-[#64748B]">
              Add{" "}
              <code className="rounded bg-[#F3EFE8] px-1">
                NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
              </code>{" "}
              to enable payments.
            </p>
          )}

          {step === "success" && (
            <div className="mt-6 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#ECFDF5] text-[#059669]">
                <svg
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="mt-4 text-[#334155]">
                Your intro week is active. Head to the dashboard to start
                studying.
              </p>
              <Link href="/dashboard" className="mt-6 inline-block">
                <Button className="h-11 px-6">Go to dashboard</Button>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
