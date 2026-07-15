"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { saveSignupPreferences } from "@/lib/auth/save-signup-preferences";
import {
  getPlan,
  isSubscriptionPlanId,
  type SubscriptionPlanId,
} from "@/lib/stripe/plans";
import { trackPurchase } from "@/lib/analytics/track-purchase";
import { TRADES } from "@/data/seed";
import {
  DEFAULT_PROVINCE,
  PROVINCES,
  type ProvinceCode,
} from "@/lib/provinces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppleIcon, GoogleIcon } from "@/components/auth/oauth-icons";
import { getOAuthErrorMessage } from "@/lib/auth/oauth-errors";

const DRAWER_ANIM_MS = 300;
const SIGNUP_TRADES = [...TRADES]
  .filter((trade) => trade.status !== "coming_soon")
  .sort((a, b) => a.name.localeCompare(b.name));

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type Step = "auth" | "checkout" | "success";

type CheckoutDrawerProps = {
  planId: SubscriptionPlanId | null;
  open: boolean;
  onClose: () => void;
  defaultTradeSlug?: string | null;
};

export function CheckoutDrawer({
  planId,
  open,
  onClose,
  defaultTradeSlug = null,
}: CheckoutDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = planId ? getPlan(planId) : null;
  const preselectedTrade =
    defaultTradeSlug &&
    SIGNUP_TRADES.some((trade) => trade.slug === defaultTradeSlug)
      ? defaultTradeSlug
      : "";

  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [displayPlan, setDisplayPlan] = useState(plan);

  const [step, setStep] = useState<Step>("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [tradeSlug, setTradeSlug] = useState(preselectedTrade);
  const [province, setProvince] = useState<ProvinceCode>(DEFAULT_PROVINCE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
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
      if (
        data.demo ||
        typeof data.clientSecret !== "string" ||
        !data.clientSecret
      ) {
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : "Payment is unavailable right now. Please try again later.",
        );
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
    setNotice(null);
    setTradeSlug(preselectedTrade);
    setCheckingSession(true);
    void checkAuth();
  }, [open, planId, checkAuth, preselectedTrade]);

  useEffect(() => {
    // Only celebrate from a Stripe return URL that includes a session id.
    // Bare ?checkout=success must not unlock the success UI without payment.
    if (searchParams.get("checkout") !== "success") return;
    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;
    setStep("success");
    const plan = searchParams.get("plan");
    if (planId && isSubscriptionPlanId(planId)) {
      trackPurchase({ planId, transactionId: sessionId });
    } else if (plan && isSubscriptionPlanId(plan)) {
      trackPurchase({ planId: plan, transactionId: sessionId });
    }
  }, [searchParams, planId]);

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
    setError(null);
    setNotice(null);

    if (isSignUp && !tradeSlug) {
      setError("Please select your trade before continuing.");
      return;
    }

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
        options: {
          data: {
            trade_slug: tradeSlug,
            province,
          },
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        try {
          await saveSignupPreferences(supabase, user.id, {
            tradeSlug,
            province,
          });
        } catch {
          // Dashboard onboarding is the fallback if preferences cannot be saved.
        }
      } else {
        setNotice(
          "Check your email to confirm your account, then return to finish checkout.",
        );
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
    setError(null);
    setNotice(null);
    if (isSignUp && !tradeSlug) {
      setError("Please select your trade before continuing.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setError("Sign-in is not configured yet.");
      return;
    }
    const supabase = createClient();
    const origin = window.location.origin;
    const next = planId ? `/?checkout=resume&plan=${planId}` : "/";
    const callbackParams = new URLSearchParams({
      next,
    });
    if (isSignUp) {
      callbackParams.set("trade", tradeSlug);
      callbackParams.set("province", province);
    }
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${origin}/auth/callback?${callbackParams.toString()}`,
      },
    });
    if (oauthError)
      setError(getOAuthErrorMessage(provider, oauthError.message));
  };

  const handleCheckoutComplete = useCallback(() => {
    if (planId) {
      trackPurchase({ planId });
    }
    setStep("success");
    router.refresh();
  }, [planId, router]);

  const embeddedCheckoutOptions = useMemo(
    () => ({
      clientSecret: clientSecret ?? "",
      onComplete: handleCheckoutComplete,
    }),
    [clientSecret, handleCheckoutComplete],
  );

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
        aria-describedby={
          step === "success" ? undefined : "checkout-drawer-terms"
        }
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
              {step === "success" ? "You're in!" : "Complete subscription"}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close checkout"
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
                  ${displayPlan.price.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-[#94A3B8]">
                  CAD {displayPlan.periodLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-[#64748B]">
                {displayPlan.billingNote}
              </p>
              <p
                id="checkout-drawer-terms"
                className="mt-2 text-xs text-[#64748B]"
              >
                Renews automatically until cancelled ·{" "}
                <span className="group relative inline-flex">
                  <button
                    type="button"
                    aria-describedby="checkout-refund-tooltip"
                    className="cursor-help font-semibold text-[#C0271E] underline decoration-dotted underline-offset-2"
                  >
                    24-hour refund policy
                  </button>
                  <span
                    id="checkout-refund-tooltip"
                    role="tooltip"
                    className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-64 rounded-xl bg-[#1F2A37] px-3.5 py-3 text-left text-xs font-medium leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                  >
                    Request a full refund within 24 hours of starting your plan.
                    After that window, payments are non-refundable. Approved
                    refunds usually appear in 5–10 business days.
                  </span>
                </span>
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
              {isSignUp && (
                <div className="mb-5 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">
                      Trade
                    </label>
                    <select
                      value={tradeSlug}
                      onChange={(e) => setTradeSlug(e.target.value)}
                      className="h-10 w-full rounded-[10px] border border-[#E5E0D8] bg-white px-3 text-sm"
                      required
                    >
                      <option value="">Select trade</option>
                      {SIGNUP_TRADES.map((trade) => (
                        <option key={trade.id} value={trade.slug}>
                          {trade.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">
                      Province
                    </label>
                    <select
                      value={province}
                      onChange={(e) =>
                        setProvince(e.target.value as ProvinceCode)
                      }
                      className="h-10 w-full rounded-[10px] border border-[#E5E0D8] bg-white px-3 text-sm"
                      required
                    >
                      {PROVINCES.map((entry) => (
                        <option key={entry.code} value={entry.code}>
                          {entry.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

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
                {notice && (
                  <p className="rounded-[10px] border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-sm font-semibold text-[#047857]">
                    {notice}
                  </p>
                )}
                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={loading || (isSignUp && !tradeSlug)}
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
                options={embeddedCheckoutOptions}
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
                Your plan is active. Head to the dashboard to start studying.
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
