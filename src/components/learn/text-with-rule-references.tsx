"use client";

import { useCallback, useState } from "react";
import { TranslatableText } from "@/components/translation/translatable-text";
import { RuleReferenceModal } from "@/components/learn/rule-reference-modal";
import {
  parseRuleCitations,
  textHasRuleCitations,
} from "@/lib/reference/parse-rule-citations";
import type { ReferenceChunk } from "@/types";

export function TextWithRuleReferences({
  text,
  lessonId,
  className,
  codeVersion,
}: {
  text: string;
  lessonId?: string;
  className?: string;
  codeVersion?: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRuleLabel, setActiveRuleLabel] = useState("");
  const [chunk, setChunk] = useState<ReferenceChunk | null>(null);
  const [loading, setLoading] = useState(false);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setChunk(null);
    setLoading(false);
  }, []);

  const openRule = useCallback(
    async (ruleNumber: string, ruleLabel: string) => {
      setActiveRuleLabel(ruleLabel);
      setModalOpen(true);
      setChunk(null);
      setLoading(true);

      try {
        const params = new URLSearchParams({ rule_number: ruleNumber });
        if (codeVersion) params.set("code_version", codeVersion);
        const res = await fetch(`/api/reference/lookup?${params}`);
        if (!res.ok) throw new Error("Lookup failed");
        const data = (await res.json()) as { chunk: ReferenceChunk | null };
        setChunk(data.chunk);
      } catch {
        setChunk(null);
      } finally {
        setLoading(false);
      }
    },
    [codeVersion],
  );

  if (!textHasRuleCitations(text)) {
    return (
      <TranslatableText text={text} lessonId={lessonId} className={className} />
    );
  }

  const segments = parseRuleCitations(text);

  return (
    <>
      <span className={className}>
        {segments.map((segment, index) =>
          segment.type === "text" ? (
            <TranslatableText
              key={index}
              text={segment.content}
              lessonId={lessonId}
            />
          ) : (
            <button
              key={index}
              type="button"
              onClick={() => void openRule(segment.ruleNumber, segment.content)}
              className="inline cursor-pointer rounded-sm font-[family-name:var(--font-ibm-mono)] text-[0.95em] font-medium text-[#C0271E] underline decoration-[#C0271E]/35 underline-offset-2 transition-colors hover:bg-[#FCEBEC]/60 hover:decoration-[#C0271E]"
            >
              {segment.content}
            </button>
          ),
        )}
      </span>

      <RuleReferenceModal
        open={modalOpen}
        onClose={closeModal}
        ruleLabel={activeRuleLabel}
        chunk={chunk}
        loading={loading}
      />
    </>
  );
}
