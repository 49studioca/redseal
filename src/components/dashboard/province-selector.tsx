"use client";

import { MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDashboardPreferences } from "@/components/layout/dashboard-preferences-context";
import { PROVINCES } from "@/lib/provinces";
import { cn } from "@/lib/utils";

export function ProvinceSelector({
  variant = "sidebar",
}: {
  variant?: "sidebar" | "menu";
}) {
  const router = useRouter();
  const { province, provinceName, setProvince, isUpdatingProvince } =
    useDashboardPreferences();

  const handleChange = (code: string) => {
    void setProvince(code).then(() => router.refresh());
  };

  if (variant === "menu") {
    return (
      <div className="border-b border-white/10 px-3 py-3">
        <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide text-[#7DA0BD]">
          <MapPin className="h-3.5 w-3.5 text-[#F4A11A]" />
          Study province
        </label>
        <select
          value={province}
          disabled={isUpdatingProvince}
          onChange={(e) => handleChange(e.target.value)}
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
        <p className="mt-1.5 text-[11px] leading-snug text-[#7DA0BD]">
          Lessons and practice use {provinceName} code context
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[13px] border border-[#E5E0D8] bg-white p-3">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
        <MapPin className="h-3.5 w-3.5 text-[#C0271E]" />
        Study province
      </div>
      <p className="mt-1 text-[11px] leading-snug text-[#94A3B8]">
        Lessons and practice adapt to your provincial code context
      </p>
      <select
        value={province}
        disabled={isUpdatingProvince}
        onChange={(e) => handleChange(e.target.value)}
        className={cn(
          "mt-2.5 w-full rounded-[10px] border border-[#E5E0D8] bg-[#F6F3EE] px-2.5 py-2 text-[13px] font-semibold text-[#1F2A37] outline-none focus:border-[#C0271E] focus:ring-1 focus:ring-[#C0271E]/30 disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {PROVINCES.map((entry) => (
          <option key={entry.code} value={entry.code}>
            {entry.name} ({entry.code})
          </option>
        ))}
      </select>
    </div>
  );
}
