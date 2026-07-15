"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Wrench } from "lucide-react";
import { TRADES } from "@/data/seed";
import { useDashboardPreferences } from "@/components/layout/dashboard-preferences-context";
import { setDemoPreferences } from "@/lib/demo-preferences";
import { PROVINCES } from "@/lib/provinces";
import { trackEvent } from "@/lib/analytics/track-event";
import { usesSupabaseData } from "@/lib/supabase/config";
import { cn } from "@/lib/utils";
import type { Trade } from "@/types";

const SELECTABLE_TRADES = [...TRADES]
  .filter((trade) => trade.status !== "coming_soon")
  .sort((a, b) => a.name.localeCompare(b.name));

export function HeaderTradeProvinceMenu({ trade }: { trade: Trade }) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUpdatingTrade, setIsUpdatingTrade] = useState(false);
  const { province, provinceName, setProvince, isUpdatingProvince } =
    useDashboardPreferences();

  const selectedTradeSlug = useMemo(() => {
    const match = SELECTABLE_TRADES.find(
      (entry) => entry.code === trade.code || entry.slug === trade.slug,
    );
    return match?.slug ?? trade.slug;
  }, [trade.code, trade.slug]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleProvinceChange = (code: string) => {
    void setProvince(code).then(() => router.refresh());
  };

  const handleTradeChange = async (tradeSlug: string) => {
    if (tradeSlug === selectedTradeSlug) return;

    setIsUpdatingTrade(true);

    try {
      const seedTrade = TRADES.find((entry) => entry.slug === tradeSlug);
      if (!seedTrade) return;

      if (usesSupabaseData()) {
        const res = await fetch("/api/profile/trade", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trade_slug: tradeSlug }),
        });
        if (!res.ok) {
          console.warn("Could not sync trade to profile");
          return;
        }
      } else {
        setDemoPreferences(seedTrade.id, province);
      }

      trackEvent("select_content", {
        content_type: "trade",
        item_id: seedTrade.id,
        trade_slug: tradeSlug,
        source: "header_menu",
      });

      setMenuOpen(false);
      router.push("/dashboard");
      router.refresh();
    } finally {
      setIsUpdatingTrade(false);
    }
  };

  const isBusy = isUpdatingTrade || isUpdatingProvince;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        onClick={() => setMenuOpen((open) => !open)}
        className="flex h-11 items-center gap-1.5 rounded-[10px] border border-white/15 bg-white/5 px-2 text-white transition-colors hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:h-[42px] sm:gap-2.5 sm:px-3.5"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#C0271E] text-sm">
          {trade.icon}
        </span>
        <div className="hidden flex-col items-start leading-tight sm:flex">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#7DA0BD]">
            Your trade · {province}
          </span>
          <span className="text-sm font-bold">{trade.short_name}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[#7DA0BD] transition-transform",
            menuOpen && "rotate-180",
          )}
        />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="fixed left-3 right-3 top-[68px] z-50 overflow-hidden rounded-[14px] border border-white/10 bg-[#1F2A37] p-4 shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+8px)] sm:w-[280px] sm:p-3"
        >
          <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[#7DA0BD]">
            <Wrench className="h-3.5 w-3.5 text-[#F4A11A]" />
            Your trade
          </label>
          <select
            value={selectedTradeSlug}
            disabled={isBusy}
            onChange={(e) => void handleTradeChange(e.target.value)}
            className="mt-2 w-full rounded-[8px] border border-white/15 bg-white/5 px-2.5 py-2 text-[13px] font-semibold text-white outline-none focus:border-[#C0271E] focus:ring-1 focus:ring-[#C0271E]/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {SELECTABLE_TRADES.map((entry) => (
              <option
                key={entry.slug}
                value={entry.slug}
                className="bg-[#1F2A37] text-white"
              >
                {entry.icon} {entry.name} ({entry.code})
              </option>
            ))}
          </select>

          <label className="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[#7DA0BD]">
            <MapPin className="h-3.5 w-3.5 text-[#F4A11A]" />
            Study province
          </label>
          <select
            value={province}
            disabled={isBusy}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="mt-2 w-full rounded-[8px] border border-white/15 bg-white/5 px-2.5 py-2 text-[13px] font-semibold text-white outline-none focus:border-[#C0271E] focus:ring-1 focus:ring-[#C0271E]/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {PROVINCES.map((entry) => (
              <option
                key={entry.code}
                value={entry.code}
                className="bg-[#1F2A37] text-white"
              >
                {entry.name} ({entry.code})
              </option>
            ))}
          </select>
          <p className="mt-2 text-[11px] leading-snug text-[#7DA0BD]">
            Lessons and practice use {provinceName} code context
          </p>
        </div>
      )}
    </div>
  );
}
