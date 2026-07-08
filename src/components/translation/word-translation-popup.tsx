"use client";

import { Bookmark, BookmarkCheck, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isRtlLanguage } from "@/lib/translation/languages";
import { cn } from "@/lib/utils";

export type WordTranslationData = {
  word: string;
  translation: string;
  definition: string;
  context_explanation: string;
  cached?: boolean;
  saved?: boolean;
  saved_id?: string | null;
};

interface WordTranslationPopupProps {
  data: WordTranslationData | null;
  loading: boolean;
  error: string | null;
  position: { top: number; left: number };
  targetLanguage: string;
  onClose: () => void;
  onSave: () => void;
  onUnsave: () => void;
  saving: boolean;
}

export function WordTranslationPopup({
  data,
  loading,
  error,
  position,
  targetLanguage,
  onClose,
  onSave,
  onUnsave,
  saving,
}: WordTranslationPopupProps) {
  const rtl = isRtlLanguage(targetLanguage);
  const translatedTextClass = cn(
    "text-sm leading-relaxed",
    rtl && "text-right [unicode-bidi:plaintext]",
  );

  return (
    <div
      id="word-translation-popup"
      className="fixed z-50 w-[min(320px,calc(100vw-24px))] rounded-xl border border-[#E5E0D8] bg-white p-4 shadow-xl"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Looking up word…
            </div>
          ) : error ? (
            <p className="text-sm text-[#C0271E]">{error}</p>
          ) : data ? (
            <>
              <div className="font-[family-name:var(--font-barlow-semi)] text-lg font-bold capitalize text-[#1F2A37]">
                {data.word}
              </div>
              <div
                dir={rtl ? "rtl" : "ltr"}
                className={cn(
                  "mt-1 text-[15px] font-semibold text-[#C0271E]",
                  rtl && "text-right",
                )}
              >
                {data.translation}
              </div>
            </>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-[#94A3B8] hover:bg-[#F6F3EE] hover:text-[#475569]"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {data && !loading && !error && (
        <>
          <p
            dir={rtl ? "rtl" : "ltr"}
            className={cn(
              "mt-3 text-sm leading-relaxed text-[#475569]",
              rtl && "text-right",
            )}
          >
            {data.definition}
          </p>
          {data.context_explanation && (
            <div className="mt-3 rounded-lg bg-[#F6F3EE] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
                In this context
              </div>
              <p
                dir={rtl ? "rtl" : "ltr"}
                className={cn(translatedTextClass, "mt-1 text-[#334155]")}
              >
                {data.context_explanation}
              </p>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-[10px] text-[#94A3B8]">
              {data.cached ? "From cache" : "AI generated"}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={saving}
              onClick={data.saved ? onUnsave : onSave}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : data.saved ? (
                <>
                  <BookmarkCheck className="h-3.5 w-3.5" /> Saved
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5" /> Save word
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
