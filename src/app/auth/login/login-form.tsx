"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const authError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    authError === "auth" ? "Authentication failed. Please try again." : null,
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
    router.push(redirectTo);
    router.refresh();
  };

  const handleDemo = () => {
    router.push(redirectTo);
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-[#D8232A] to-[#B81A20] p-12 text-white lg:flex lg:flex-col lg:justify-center">
        <Image
          src="/redseal-logo.svg"
          alt="RedSeal Guide"
          width={80}
          height={80}
        />
        <h1 className="mt-6 font-[family-name:var(--font-barlow-condensed)] text-5xl font-bold">
          RedSeal Guide
        </h1>
        <p className="mt-4 max-w-md text-lg text-[#FCE3E4]">
          AI-powered prep for Canada&apos;s Red Seal trades exams.
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">
            Log in to continue your exam prep
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                required
              />
            </div>
            {error && <p className="text-sm text-[#B91C1C]">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#E5E0D8]" />
            <span className="text-xs text-[#94A3B8]">or</span>
            <div className="h-px flex-1 bg-[#E5E0D8]" />
          </div>

          <Button variant="secondary" className="w-full" onClick={handleDemo}>
            Continue in demo mode
          </Button>

          <p className="mt-6 text-center text-sm text-[#64748B]">
            No account?{" "}
            <Link href="/auth/signup" className="font-semibold text-[#C0271E]">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
