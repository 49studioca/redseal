"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Sparkles, Zap } from "lucide-react";
import { TRADES } from "@/data/seed";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppleIcon, GoogleIcon } from "@/components/auth/oauth-icons";
import { getOAuthErrorMessage } from "@/lib/auth/oauth-errors";
import { DEVICE_LIMIT_MESSAGE } from "@/lib/auth/devices";
import { saveSignupPreferences } from "@/lib/auth/save-signup-preferences";
import { parseSignupContext } from "@/lib/auth/signup-context";
import { setDemoPreferences } from "@/lib/demo-preferences";
import {
  DEFAULT_PROVINCE,
  PROVINCES,
  type ProvinceCode,
} from "@/lib/provinces";

const SIGNUP_TRADES = [...TRADES]
  .filter((trade) => trade.status !== "coming_soon")
  .sort((a, b) => a.name.localeCompare(b.name));

const SIGNUP_BENEFITS = [
  "All 56 Red Seal trades covered",
  "First AI quiz ready in under 2 minutes",
  "No credit card needed to start",
] as const;

function AuthPitchPanel({ isSignup }: { isSignup: boolean }) {
  const signupHref = "/auth?signup";

  return (
    <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-[#D8232A] to-[#B81A20] p-12 text-white lg:flex lg:flex-col lg:justify-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #fff 1.5px, transparent 0)",
          backgroundSize: "26px 26px",
          maskImage: "linear-gradient(180deg, #000, transparent 92%)",
        }}
      />
      <div className="pointer-events-none absolute bottom-[-80px] right-[-90px] h-[280px] w-[280px] rounded-full border-2 border-dashed border-white/20" />

      <div className="relative">
        <Image
          src="/redseal-logo.svg"
          alt="RedSeal Guide"
          width={72}
          height={72}
        />

        <div className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-bold text-[#FCE3E4]">
          <Sparkles className="h-3.5 w-3.5 text-[#F4A11A]" />
          Free to start — upgrade anytime
        </div>

        <h1 className="mt-5 max-w-md font-[family-name:var(--font-barlow-condensed)] text-[44px] font-bold leading-[0.98] tracking-tight">
          Pass your Red Seal the{" "}
          <span className="underline decoration-white/45 decoration-2 underline-offset-4">
            first time.
          </span>
        </h1>

        <p className="mt-4 max-w-md text-lg leading-snug text-[#FCE3E4]">
          AI-built lessons, drills, and mock exams for every trade — start in
          seconds.
        </p>

        <ul className="mt-7 space-y-3">
          {SIGNUP_BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-2.5 text-[15px] font-semibold text-[#FCE3E4]"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-white" />
              {benefit}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-2">
          {[
            { value: "56", label: "trades" },
            { value: "40k+", label: "questions" },
            { value: "13", label: "provinces" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/15 bg-white/[0.08] px-3.5 py-2.5"
            >
              <div className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold leading-none">
                {stat.value}
              </div>
              <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#FCE3E4]/80">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {!isSignup && (
          <Link href={signupHref} className="mt-8 inline-block">
            <Button
              variant="white"
              size="lg"
              className="h-12 rounded-xl px-6 text-base font-extrabold shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
            >
              <Zap className="h-5 w-5" />
              Start free — takes 30 seconds
            </Button>
          </Link>
        )}

        {isSignup && (
          <p className="mt-8 text-sm font-semibold text-[#FCE3E4]/90">
            Join thousands of apprentices prepping smarter, not harder.
          </p>
        )}
      </div>
    </div>
  );
}

function AuthMobilePitch() {
  return (
    <div className="mb-4 rounded-xl border border-[#F4C4C6] bg-[#FEF2F2] p-3 lg:hidden">
      <p className="text-sm font-bold text-[#1F2A37]">
        Free to start — no credit card needed
      </p>
      <p className="mt-0.5 text-xs text-[#64748B]">
        Your first AI quiz is ready in under 2 minutes.
      </p>
    </div>
  );
}

function buildSwitchHref(
  isSignup: boolean,
  redirectTo: string,
  tradeSlug: string,
  province: ProvinceCode,
) {
  const params = new URLSearchParams();
  if (isSignup) {
    params.set("signin", "");
    if (redirectTo !== "/dashboard") {
      params.set("redirect", redirectTo);
    }
  } else {
    params.set("signup", "");
    if (tradeSlug) params.set("trade", tradeSlug);
    if (province) params.set("province", province);
    if (redirectTo !== "/onboarding") {
      params.set("redirect", redirectTo);
    }
  }
  return `/auth?${params.toString()}`;
}

function safeRedirectPath(value: string | null, fallback: string) {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

function buildOAuthCallbackUrl(
  origin: string,
  tradeSlug: string,
  province: ProvinceCode,
) {
  const params = new URLSearchParams();
  const next = tradeSlug && province ? "/dashboard" : "/onboarding";
  params.set("next", next);
  if (tradeSlug) params.set("trade", tradeSlug);
  if (province) params.set("province", province);
  return `${origin}/auth/callback?${params.toString()}`;
}

async function registerCurrentDevice(): Promise<string | null> {
  const res = await fetch("/api/profile/devices", { method: "POST" });
  const data = (await res.json()) as { message?: string; error?: string };

  if (res.ok) return null;
  if (data.error === "device_limit") {
    return data.message ?? DEVICE_LIMIT_MESSAGE;
  }
  return "Could not register this device. Please try again.";
}

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignup = !searchParams.has("signin");
  const signupContext = useMemo(
    () => parseSignupContext(searchParams),
    [searchParams],
  );
  const redirectTo =
    safeRedirectPath(
      searchParams.get("redirect"),
      isSignup ? "/onboarding" : "/dashboard",
    );
  const authError = searchParams.get("error");
  const deviceLimitMessage = searchParams.get("message");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const initialTrade = signupContext.tradeSlug
    ? TRADES.find((t) => t.slug === signupContext.tradeSlug)
    : undefined;
  const [tradeSlug, setTradeSlug] = useState(
    initialTrade && initialTrade.status !== "coming_soon"
      ? initialTrade.slug
      : "",
  );
  const [province, setProvince] = useState<ProvinceCode>(
    signupContext.province ?? DEFAULT_PROVINCE,
  );
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(() => {
    if (authError === "device_limit") {
      return deviceLimitMessage ?? DEVICE_LIMIT_MESSAGE;
    }
    if (authError === "auth") {
      return "Authentication failed. Please try again.";
    }
    return null;
  });
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isSignup) {
      setError(null);
      return;
    }
    if (authError === "device_limit") {
      setError(deviceLimitMessage ?? DEVICE_LIMIT_MESSAGE);
      return;
    }
    setError(
      authError === "auth" ? "Authentication failed. Please try again." : null,
    );
  }, [isSignup, authError, deviceLimitMessage]);

  const switchHref = buildSwitchHref(isSignup, redirectTo, tradeSlug, province);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    if (!isSupabaseConfigured()) {
      router.push(redirectTo);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const deviceError = await registerCurrentDevice();
    if (deviceError) {
      await supabase.auth.signOut();
      setError(deviceError);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    if (!tradeSlug) {
      setError("Please select your trade.");
      setLoading(false);
      return;
    }

    const postSignupPath = tradeSlug && province ? "/dashboard" : "/onboarding";

    if (!isSupabaseConfigured()) {
      const trade = TRADES.find((t) => t.slug === tradeSlug);
      if (trade) {
        setDemoPreferences(trade.id, province);
      }
      router.push(postSignupPath);
      return;
    }

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          trade_slug: tradeSlug || undefined,
          province,
        },
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user && data.session) {
      const deviceError = await registerCurrentDevice();
      if (deviceError) {
        await supabase.auth.signOut();
        setError(deviceError);
        setLoading(false);
        return;
      }

      try {
        const { onboardingComplete } = await saveSignupPreferences(
          supabase,
          data.user.id,
          { tradeSlug, province },
        );
        router.push(onboardingComplete ? "/dashboard" : postSignupPath);
      } catch {
        router.push(postSignupPath);
      }
    } else {
      setNotice(
        "Check your email to confirm your account, then log in to continue.",
      );
      setLoading(false);
      return;
    }
    router.refresh();
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setOauthLoading(provider);
    setError(null);
    setNotice(null);

    if (isSignup && !tradeSlug) {
      setError("Please select your trade before continuing.");
      setOauthLoading(null);
      return;
    }

    if (!isSupabaseConfigured()) {
      router.push(redirectTo);
      return;
    }

    const supabase = createClient();
    const origin = window.location.origin;
    const oauthRedirectTo = isSignup
      ? buildOAuthCallbackUrl(origin, tradeSlug, province)
      : `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: oauthRedirectTo,
      },
    });
    if (oauthError) {
      setError(getOAuthErrorMessage(provider, oauthError.message));
      setOauthLoading(null);
    }
  };

  const isBusy = loading || oauthLoading !== null;

  return (
    <div className="flex min-h-screen">
      <AuthPitchPanel isSignup={isSignup} />
      <div className="flex flex-1 items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {isSignup && <AuthMobilePitch />}

          <h2 className="font-[family-name:var(--font-barlow-semi)] text-xl font-bold sm:text-2xl">
            {isSignup ? "Create your free account" : "Welcome back"}
          </h2>
          {!isSignup && (
            <p className="mt-1 text-xs text-[#64748B] sm:text-sm">
              Log in to continue your exam prep
            </p>
          )}

          {isSignup && (
            <div className="mt-5 space-y-2.5 sm:mt-6">
              <div>
                <label className="mb-1 block text-xs font-semibold">
                  Your trade
                </label>
                <select
                  value={tradeSlug}
                  onChange={(e) => setTradeSlug(e.target.value)}
                  className="h-9 w-full rounded-[10px] border border-[#E5E0D8] bg-white px-3 text-sm"
                  required
                >
                  <option value="">Select your trade</option>
                  {SIGNUP_TRADES.map((trade) => (
                    <option key={trade.id} value={trade.slug}>
                      {trade.name} ({trade.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">
                  Your province
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value as ProvinceCode)}
                  className="h-9 w-full rounded-[10px] border border-[#E5E0D8] bg-white px-3 text-sm"
                  required
                >
                  {PROVINCES.map((entry) => (
                    <option key={entry.code} value={entry.code}>
                      {entry.name} ({entry.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {error && <p className="mt-3 text-xs text-[#B91C1C]">{error}</p>}
          {notice && (
            <p className="mt-3 rounded-[10px] border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-xs font-semibold text-[#047857]">
              {notice}
            </p>
          )}

          <div className={`grid gap-2 ${isSignup ? "mt-4" : "mt-5 sm:mt-6"}`}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-9 w-full justify-center gap-2"
              disabled={isBusy}
              onClick={() => void handleOAuth("google")}
            >
              <GoogleIcon />
              {oauthLoading === "google"
                ? "Connecting..."
                : isSignup
                  ? "Sign up with Google"
                  : "Continue with Google"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-9 w-full justify-center gap-2"
              disabled={isBusy}
              onClick={() => void handleOAuth("apple")}
            >
              <AppleIcon />
              {oauthLoading === "apple"
                ? "Connecting..."
                : isSignup
                  ? "Sign up with Apple"
                  : "Continue with Apple"}
            </Button>
          </div>

          <div className="my-4 flex items-center gap-3 sm:my-5">
            <div className="h-px flex-1 bg-[#E5E0D8]" />
            <span className="text-xs text-[#94A3B8]">or email</span>
            <div className="h-px flex-1 bg-[#E5E0D8]" />
          </div>

          <form
            onSubmit={isSignup ? handleSignUp : handleSignIn}
            className="space-y-2.5"
          >
            {isSignup && (
              <div>
                <label className="mb-1 block text-xs font-semibold">
                  Full name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 px-3 text-sm"
                  autoComplete="name"
                  required
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-xs font-semibold">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 px-3 text-sm"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={isSignup ? 8 : undefined}
                className="h-9 px-3 text-sm"
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="mt-1 h-9 w-full"
              disabled={isBusy}
            >
              {loading
                ? isSignup
                  ? "Creating account..."
                  : "Signing in..."
                : isSignup
                  ? "Sign up free"
                  : "Sign in"}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-[#64748B] sm:text-sm">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <Link
                  href={switchHref}
                  className="font-semibold text-[#C0271E]"
                >
                  Log in
                </Link>
              </>
            ) : (
              <>
                No account?{" "}
                <Link
                  href={switchHref}
                  className="font-semibold text-[#C0271E]"
                >
                  Sign up free
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
