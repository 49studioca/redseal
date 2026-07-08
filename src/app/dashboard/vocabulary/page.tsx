"use client";

import { useCallback, useEffect, useState } from "react";
import { Bookmark, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getLanguageNativeLabel,
  isRtlLanguage,
} from "@/lib/translation/languages";
import { cn } from "@/lib/utils";

type SavedWord = {
  id: string;
  word: string;
  target_language: string;
  translation: string | null;
  definition: string | null;
  context_explanation: string | null;
  context_snippet: string | null;
  created_at: string;
};

export default function VocabularyPage() {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadWords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vocabulary");
      const body = await res.json();
      setWords(body.words ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWords();
  }, [loadWords]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/vocabulary?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      setWords((prev) => prev.filter((w) => w.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCEBEC] text-[#C0271E]">
          <Bookmark className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-[family-name:var(--font-barlow-semi)] text-3xl font-bold">
            Saved Words
          </h1>
          <p className="text-[#64748B]">
            Words you saved while reading lessons — turn on translation in the
            sidebar, click any word, and save it here.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-10 flex items-center gap-2 text-[#64748B]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading saved words…
        </div>
      ) : words.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-[#E5E0D8] bg-white p-10 text-center">
          <p className="font-semibold text-[#475569]">No saved words yet</p>
          <p className="mt-2 text-sm text-[#94A3B8]">
            Open a lesson, turn on translation in the sidebar, click any word to
            translate and save it.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {words.map((word) => {
            const rtl = isRtlLanguage(word.target_language);
            return (
              <li
                key={word.id}
                className="rounded-xl border border-[#E5E0D8] bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-[family-name:var(--font-barlow-semi)] text-lg font-bold capitalize">
                        {word.word}
                      </span>
                      <span className="rounded-full bg-[#F6F3EE] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#64748B]">
                        {getLanguageNativeLabel(word.target_language)}
                      </span>
                    </div>
                    {word.translation && (
                      <p
                        dir={rtl ? "rtl" : "ltr"}
                        className={cn(
                          "mt-1 text-[15px] font-semibold text-[#C0271E]",
                          rtl && "text-right",
                        )}
                      >
                        {word.translation}
                      </p>
                    )}
                    {word.definition && (
                      <p
                        dir={rtl ? "rtl" : "ltr"}
                        className={cn(
                          "mt-2 text-sm text-[#475569]",
                          rtl && "text-right",
                        )}
                      >
                        {word.definition}
                      </p>
                    )}
                    {word.context_explanation && (
                      <p
                        dir={rtl ? "rtl" : "ltr"}
                        className={cn(
                          "mt-2 rounded-lg bg-[#F6F3EE] p-3 text-sm text-[#334155]",
                          rtl && "text-right [unicode-bidi:plaintext]",
                        )}
                      >
                        {word.context_explanation}
                      </p>
                    )}
                    {word.context_snippet && (
                      <p className="mt-2 text-xs italic text-[#94A3B8]">
                        “…{word.context_snippet}…”
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deletingId === word.id}
                    onClick={() => void handleDelete(word.id)}
                    aria-label="Remove saved word"
                  >
                    {deletingId === word.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-[#94A3B8]" />
                    )}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
