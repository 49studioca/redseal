"use client";

import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardPreferences } from "@/components/layout/dashboard-preferences-context";
import { TRANSLATION_LANGUAGES } from "@/lib/translation/languages";

export function LanguageSelector() {
  const {
    preferredLanguage,
    setPreferredLanguage,
    isUpdatingLanguage,
    translationEnabled,
    setTranslationEnabled,
  } = useDashboardPreferences();

  return (
    <div className="rounded-[13px] border border-[#E5E0D8] bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-[#64748B]">
          <Languages className="h-3.5 w-3.5 text-[#C0271E]" />
          Word translation
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={translationEnabled}
          aria-label={
            translationEnabled ? "Turn off translation" : "Turn on translation"
          }
          onClick={() => setTranslationEnabled(!translationEnabled)}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors",
            translationEnabled ? "bg-[#C0271E]" : "bg-[#E5E0D8]",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
              translationEnabled && "translate-x-5",
            )}
          />
        </button>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-[#94A3B8]">
        {translationEnabled
          ? "Click any word in lessons for help in your language"
          : "Turn on to translate lesson words"}
      </p>
      <label className="mt-2.5 block text-[10px] font-bold uppercase tracking-wide text-[#94A3B8]">
        Translation language
      </label>
      <select
        value={preferredLanguage}
        disabled={!translationEnabled || isUpdatingLanguage}
        onChange={(e) => void setPreferredLanguage(e.target.value)}
        className="mt-1.5 w-full rounded-[10px] border border-[#E5E0D8] bg-[#F6F3EE] px-2.5 py-2 text-[13px] font-semibold text-[#1F2A37] outline-none focus:border-[#C0271E] focus:ring-1 focus:ring-[#C0271E]/30 disabled:cursor-not-allowed disabled:opacity-50"
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
