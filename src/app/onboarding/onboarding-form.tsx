"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TRADES } from "@/data/seed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { usesSupabaseData } from "@/lib/supabase/config";
import { setDemoPreferences, setDemoProvince } from "@/lib/demo-preferences";
import { PROVINCES, type ProvinceCode } from "@/lib/provinces";

const SORTED_TRADES = [...TRADES].sort((a, b) => {
  if (a.status === "live" && b.status !== "live") return -1;
  if (b.status === "live" && a.status !== "live") return 1;
  return a.name.localeCompare(b.name);
});

export function OnboardingForm({
  initialProvince,
}: {
  initialProvince: ProvinceCode;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [province, setProvince] = useState<ProvinceCode>(initialProvince);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredTrades = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SORTED_TRADES;
    return SORTED_TRADES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q),
    );
  }, [query]);

  const handleProvinceChange = (code: ProvinceCode) => {
    setProvince(code);
    setDemoProvince(code);

    if (usesSupabaseData()) {
      void fetch("/api/profile/province", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province: code }),
      });
    }
  };

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
      <div className="mx-auto max-w-5xl px-6 py-12">
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

        <div className="mt-6">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by trade name or code (e.g. Carpenter, 403A)"
            className="h-11 w-full rounded-[10px] border border-[#E5E0D8] bg-white px-4 text-sm"
          />
          <p className="mt-2 text-xs text-[#64748B]">
            {filteredTrades.length} of {TRADES.length} Red Seal trades
            {filteredTrades.some((t) => t.status === "live")
              ? " · Ready = lessons & practice available"
              : ""}
          </p>
        </div>

        <div className="mt-6 grid max-h-[min(52vh,520px)] gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTrades.map((trade) => (
            <button
              key={trade.id}
              type="button"
              onClick={() => setSelected(trade.id)}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all",
                selected === trade.id
                  ? "border-[#C0271E] bg-[#FCEBEC] shadow-lg ring-2 ring-[#C0271E]/30"
                  : "border-[#E5E0D8] bg-white hover:border-[#C0271E]/50",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl">{trade.icon}</span>
                {trade.status === "live" ? (
                  <span className="shrink-0 rounded bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-bold text-[#047857]">
                    Ready
                  </span>
                ) : (
                  <span className="shrink-0 rounded bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-bold text-[#64748B]">
                    Blueprint
                  </span>
                )}
              </div>
              <h3 className="mt-2 font-[family-name:var(--font-barlow-semi)] text-sm font-semibold leading-snug">
                {trade.name}
              </h3>
              <p className="mt-1 text-xs text-[#64748B]">{trade.code}</p>
              {trade.is_open_book && (
                <span className="mt-2 inline-block rounded bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-bold text-[#B45309]">
                  Open-book
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredTrades.length === 0 && (
          <p className="mt-6 text-center text-sm text-[#64748B]">
            No trades match your search.
          </p>
        )}

        <div className="mt-8">
          <label className="mb-2 block text-sm font-semibold">
            Your province
          </label>
          <select
            value={province}
            onChange={(e) =>
              handleProvinceChange(e.target.value as ProvinceCode)
            }
            className="h-11 w-full max-w-xs rounded-[10px] border border-[#E5E0D8] bg-white px-4"
          >
            {PROVINCES.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.name} ({entry.code})
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
