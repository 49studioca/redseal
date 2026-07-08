"use client";

import { Languages } from "lucide-react";
import { useDashboardPreferences } from "@/components/layout/dashboard-preferences-context";
import { TRANSLATION_LANGUAGES } from "@/lib/translation/languages";

export function LanguageSelector() {
  const { preferredLanguage, setPreferredLanguage, isUpdatingLanguage } =
    useDashboardPreferences();

  return (
    <div className="rounded-[13px] border border-[#E5E0D8] bg-white p-3">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
        <Languages className="h-3.5 w-3.5 text-[#C0271E]" />
        Translation language
      </div>
      <p className="mt-1 text-[11px] leading-snug text-[#94A3B8]">
        Hover any word in lessons for help in your language
      </p>
      <select
        value={preferredLanguage}
        disabled={isUpdatingLanguage}
        onChange={(e) => void setPreferredLanguage(e.target.value)}
        className="mt-2.5 w-full rounded-[10px] border border-[#E5E0D8] bg-[#F6F3EE] px-2.5 py-2 text-[13px] font-semibold text-[#1F2A37] outline-none focus:border-[#C0271E] focus:ring-1 focus:ring-[#C0271E]/30 disabled:opacity-60"
      >
        {TRANSLATION_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeLabel} ({lang.label})
          </option>
        ))}
      </select>
    </div>
  );
}
