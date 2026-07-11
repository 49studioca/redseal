"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { useDashboardPreferences } from "@/components/layout/dashboard-preferences-context";
import { useDashboardTrade } from "@/components/layout/dashboard-trade-context";
import {
  WordTranslationPopup,
  type WordTranslationData,
} from "@/components/translation/word-translation-popup";
import {
  extractContextSnippet,
  tokenizeText,
} from "@/lib/translation/context-key";

interface TranslatableTextProps {
  text: string;
  lessonId?: string;
  className?: string;
}

export function TranslatableText({
  text,
  lessonId,
  className,
}: TranslatableTextProps) {
  const { preferredLanguage, translationEnabled, setTranslationUsage } =
    useDashboardPreferences();
  const trade = useDashboardTrade();
  const tokens = tokenizeText(text);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [popupData, setPopupData] = useState<WordTranslationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [saving, setSaving] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const contextRef = useRef("");

  useEffect(() => {
    setMounted(true);
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const closePopup = useCallback(() => {
    setActiveWordIndex(null);
    setPopupData(null);
    setError(null);
    setLimitReached(false);
    setLoading(false);
    abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!translationEnabled) closePopup();
  }, [translationEnabled, closePopup]);

  useEffect(() => {
    if (activeWordIndex === null) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (document.getElementById("word-translation-popup")?.contains(target)) {
        return;
      }
      closePopup();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [activeWordIndex, closePopup]);

  const lookupWord = useCallback(
    async (word: string, wordIndex: number, rect: DOMRect) => {
      const context = extractContextSnippet(text, wordIndex);
      contextRef.current = context;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      setLimitReached(false);
      setPopupData(null);

      const top = Math.min(rect.bottom + 8, window.innerHeight - 280);
      const left = Math.min(rect.left, window.innerWidth - 340);
      setPosition({ top: Math.max(8, top), left: Math.max(8, left) });

      try {
        const params = new URLSearchParams({
          word,
          lang: preferredLanguage,
          context,
          trade: trade.name,
        });
        const res = await fetch(`/api/translate?${params}`, {
          signal: controller.signal,
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (body.code === "translation_limit" && body.usage) {
            setTranslationUsage(body.usage);
            setLimitReached(true);
          }
          throw new Error(body.error ?? "Could not translate word");
        }
        const data = body as WordTranslationData;
        if (data.usage) {
          setTranslationUsage(data.usage);
        }
        setPopupData(data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [preferredLanguage, text, trade.name, setTranslationUsage],
  );

  const handleWordClick = (
    e: MouseEvent<HTMLSpanElement>,
    word: string,
    wordIndex: number,
  ) => {
    e.stopPropagation();
    if (activeWordIndex === wordIndex) {
      closePopup();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setActiveWordIndex(wordIndex);
    void lookupWord(word, wordIndex, rect);
  };

  const handleSave = async () => {
    if (!popupData) return;
    setSaving(true);
    try {
      const res = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: popupData.word,
          target_language: preferredLanguage,
          context_snippet: contextRef.current,
          translation: popupData.translation,
          definition: popupData.definition,
          context_explanation: popupData.context_explanation,
          lesson_id: lessonId,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not save word");
      }
      const body = await res.json();
      setPopupData((prev) =>
        prev ? { ...prev, saved: true, saved_id: body.id } : prev,
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleUnsave = async () => {
    if (!popupData?.saved_id) return;
    setSaving(true);
    try {
      const res = await fetch(
        `/api/vocabulary?id=${encodeURIComponent(popupData.saved_id)}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Could not remove saved word");
      setPopupData((prev) =>
        prev ? { ...prev, saved: false, saved_id: null } : prev,
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!translationEnabled) {
    return <span className={className}>{text}</span>;
  }

  let wordIndex = 0;

  return (
    <>
      <span ref={containerRef} className={className}>
        {tokens.map((token, i) => {
          if (!token.isWord) {
            return <span key={i}>{token.word}</span>;
          }
          const index = wordIndex++;
          const isActive = activeWordIndex === index;
          return (
            <span
              key={i}
              className={
                isActive
                  ? "cursor-pointer rounded bg-[#FCEBEC] px-0.5 text-[#C0271E] underline decoration-[#C0271E]/40 underline-offset-2"
                  : "cursor-pointer rounded px-0.5 transition-colors hover:bg-[#FCEBEC]/70 hover:text-[#C0271E]"
              }
              onClick={(e) => handleWordClick(e, token.word, index)}
            >
              {token.word}
            </span>
          );
        })}
      </span>

      {mounted &&
        activeWordIndex !== null &&
        createPortal(
          <WordTranslationPopup
            data={popupData}
            loading={loading}
            error={error}
            limitReached={limitReached}
            position={position}
            targetLanguage={preferredLanguage}
            onClose={closePopup}
            onSave={() => void handleSave()}
            onUnsave={() => void handleUnsave()}
            saving={saving}
          />,
          document.body,
        )}
    </>
  );
}
