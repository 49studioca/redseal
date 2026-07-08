"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TRADES } from "@/data/seed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { usesSupabaseData } from "@/lib/supabase/config";
import { setDemoPreferences } from "@/lib/demo-preferences";

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [province, setProvince] = useState("ON");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);

    if (usesSupabaseData()) {
      const trade = TRADES.find((t) => t.id === selected);
      if (!trade) {
        setError("Selected trade not found.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be signed in to continue.");
        setLoading(false);
        return;
      }

      const { data: dbTrade } = await supabase
        .from("trades")
        .select("id")
        .eq("code", trade.code)
        .maybeSingle();

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          ...(dbTrade?.id ? { selected_trade_id: dbTrade.id } : {}),
          province,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
    } else {
      setDemoPreferences(selected, province);
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE]">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center gap-3">
          <Image
            src="/redseal-logo.svg"
            alt="RedSealGuide"
            width={48}
            height={48}
          />
          <div>
            <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold">
              Choose your trade
            </h1>
            <p className="text-[#64748B]">
              Your entire dashboard will be set up for this exam
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRADES.filter((t) => t.status === "live").map((trade) => (
            <button
              key={trade.id}
              type="button"
              onClick={() => setSelected(trade.id)}
              className={cn(
                "rounded-2xl border p-5 text-left transition-all",
                selected === trade.id
                  ? "border-[#C0271E] bg-[#FCEBEC] shadow-lg ring-2 ring-[#C0271E]/30"
                  : "border-[#E5E0D8] bg-white hover:border-[#C0271E]/50",
              )}
            >
              <span className="text-3xl">{trade.icon}</span>
              <h3 className="mt-3 font-[family-name:var(--font-barlow-semi)] font-semibold">
                {trade.name}
              </h3>
              <p className="mt-1 text-sm text-[#64748B]">{trade.code}</p>
              {trade.is_open_book && (
                <span className="mt-2 inline-block rounded bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-bold text-[#B45309]">
                  Open-book
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <label className="mb-2 block text-sm font-semibold">
            Your province
          </label>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="h-11 w-full max-w-xs rounded-[10px] border border-[#E5E0D8] bg-white px-4"
          >
            {[
              "ON",
              "BC",
              "AB",
              "SK",
              "MB",
              "QC",
              "NB",
              "NS",
              "PE",
              "NL",
              "YT",
              "NT",
              "NU",
            ].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="mt-4 text-sm text-[#B91C1C]">{error}</p>}

        <Button
          className="mt-8"
          size="lg"
          disabled={!selected || loading}
          onClick={handleContinue}
        >
          {loading ? "Setting up..." : "Continue to dashboard"}
        </Button>
      </div>
    </div>
  );
}
