"use client";

import { useEffect, useMemo } from "react";
import { BookOpen, Loader2, X } from "lucide-react";
import {
  cleanSectionTitle,
  formatRuleContent,
  stripPdfNoise,
} from "@/lib/reference/format-rule-text";
import type { ReferenceChunk } from "@/types";

function ModalBackdrop({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rule-reference-title"
      >
        {children}
      </div>
    </div>
  );
}

function RuleBody({
  content,
  ruleNumber,
}: {
  content: string;
  ruleNumber?: string;
}) {
  const blocks = useMemo(
    () => formatRuleContent(content, ruleNumber),
    [content, ruleNumber],
  );

  if (blocks.length === 0) {
    return (
      <p className="text-[15px] leading-7 text-[#334155]">
        {stripPdfNoise(content)}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (block.type === "subrule") {
          return (
            <div key={index} className="flex gap-3">
              <span className="mt-0.5 w-7 shrink-0 font-[family-name:var(--font-ibm-mono)] text-xs font-semibold text-[#C0271E]">
                {block.number})
              </span>
              <p className="min-w-0 flex-1 text-[15px] leading-7 text-[#334155]">
                {block.text}
              </p>
            </div>
          );
        }

        if (block.type === "item") {
          return (
            <div key={index} className="ml-10 flex gap-3">
              <span className="mt-0.5 w-5 shrink-0 font-[family-name:var(--font-ibm-mono)] text-xs font-medium text-[#64748B]">
                {block.letter})
              </span>
              <p className="min-w-0 flex-1 text-[15px] leading-7 text-[#475569]">
                {block.text}
              </p>
            </div>
          );
        }

        return (
          <p key={index} className="text-[15px] leading-7 text-[#334155]">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

export function RuleReferenceModal({
  open,
  onClose,
  ruleLabel,
  chunk,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  ruleLabel: string;
  chunk: ReferenceChunk | null;
  loading: boolean;
}) {
  const title = chunk
    ? cleanSectionTitle(chunk.rule_number, chunk.section_title, chunk.content)
    : null;

  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="flex shrink-0 items-center gap-2 border-b border-[#E5E0D8] bg-[#1F2A37] px-5 py-4 text-white">
        <BookOpen className="h-5 w-5 shrink-0 text-[#F4A11A]" />
        <h2
          id="rule-reference-title"
          className="font-[family-name:var(--font-barlow-semi)] text-base font-semibold"
        >
          Code reference
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto rounded-lg p-1 hover:bg-white/10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="font-[family-name:var(--font-ibm-mono)] text-sm font-semibold tracking-wide text-[#C0271E]">
          {chunk?.rule_number ? `Rule ${chunk.rule_number}` : ruleLabel}
        </div>

        {loading ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#64748B]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading reference…
          </div>
        ) : chunk ? (
          <>
            {title && (
              <h3 className="mt-2 font-[family-name:var(--font-barlow-semi)] text-lg font-semibold leading-snug text-[#1F2A37]">
                {title}
              </h3>
            )}

            <div className="mt-4 border-t border-[#E5E0D8] pt-4">
              <RuleBody
                content={chunk.content}
                ruleNumber={chunk.rule_number}
              />
            </div>

            {(chunk.page_number || chunk.code_version) && (
              <div className="mt-5 font-[family-name:var(--font-ibm-mono)] text-xs text-[#94A3B8]">
                {chunk.page_number ? `p. ${chunk.page_number}` : null}
                {chunk.page_number && chunk.code_version ? " · " : null}
                {chunk.code_version}
              </div>
            )}
          </>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-[#64748B]">
            No reference excerpt is available for this rule yet. Check your code
            book during practice and exam prep.
          </p>
        )}
      </div>
    </ModalBackdrop>
  );
}
