"use client";

import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  DEFAULT_PROVINCE,
  PROVINCES,
  isProvinceCode,
  type ProvinceCode,
} from "@/lib/provinces";

interface ComingSoonNotifyProps {
  tradeSlug: string;
  tradeCode: string;
  tradeName: string;
}

export function ComingSoonNotify({
  tradeSlug,
  tradeCode,
  tradeName,
}: ComingSoonNotifyProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState<ProvinceCode>(DEFAULT_PROVINCE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Prefill email/province from the signed-in user when possible.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let active = true;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!active || !user) return;
        if (user.email) setEmail(user.email);
        const metaProvince = user.user_metadata?.province;
        if (typeof metaProvince === "string" && isProvinceCode(metaProvince)) {
          setProvince(metaProvince);
        }
      } catch {
        // ignore — anonymous visitor
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() && !phone.trim()) {
      setError("Enter your email or phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/trade-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trade_slug: tradeSlug,
          trade_code: tradeCode,
          trade_name: tradeName,
          province,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <section
      id="notify"
      className="mb-14 scroll-mt-24 overflow-hidden rounded-2xl border border-[#E5E0D8] bg-gradient-to-br from-[#FFF7F0] to-[#FCEBEC] p-6 sm:p-8"
    >
      <div className="flex items-center gap-2 text-[#C0271E]">
        <BellRing className="h-5 w-5" />
        <span className="text-xs font-bold uppercase tracking-wider">
          Coming soon
        </span>
      </div>
      <h2 className="mt-2 font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold tracking-tight sm:text-3xl">
        Full {tradeName} prep is on the way
      </h2>

      {done ? (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-4 text-sm text-[#047857]">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="font-semibold">
            You&apos;re on the list! We&apos;ll let you know the moment{" "}
            {tradeCode} {tradeName} prep goes live.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2 max-w-xl text-sm text-[#64748B]">
            Leave your email or phone and we&apos;ll message you to come back as
            soon as {tradeCode} content is ready.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mt-5 grid max-w-xl gap-3 sm:grid-cols-2"
          >
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-white"
            />
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-11 bg-white"
            />
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#64748B]">
                Your province
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value as ProvinceCode)}
                className="h-11 w-full rounded-[10px] border border-[#E5E0D8] bg-white px-3 text-sm"
              >
                {PROVINCES.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <BellRing className="h-4 w-4" />
                    Notify me
                  </>
                )}
              </Button>
            </div>
          </form>
          {error && <p className="mt-3 text-sm text-[#B91C1C]">{error}</p>}
          <p className="mt-3 text-xs text-[#94A3B8]">
            No spam — just a single heads-up when {tradeName} prep launches.
          </p>
        </>
      )}
    </section>
  );
}
