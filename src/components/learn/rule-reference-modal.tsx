"use client";

import { useEffect } from "react";
import { BookOpen, Loader2, X } from "lucide-react";
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
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl"
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
  return (
    <ModalBackdrop open={open} onClose={onClose}>
      <div className="flex items-center gap-2 border-b border-[#E5E0D8] bg-[#1F2A37] px-5 py-4 text-white">
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

      <div className="p-5">
        <div className="font-[family-name:var(--font-ibm-mono)] text-sm font-semibold text-[#C0271E]">
          {ruleLabel}
        </div>

        {loading ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#64748B]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading reference…
          </div>
        ) : chunk ? (
          <>
            {chunk.section_title && (
              <div className="mt-1 text-sm font-semibold text-[#64748B]">
                {chunk.section_title}
              </div>
            )}
            <p className="mt-3 text-sm leading-relaxed text-[#475569]">
              {chunk.content}
            </p>
            {(chunk.page_number || chunk.code_version) && (
              <div className="mt-4 font-[family-name:var(--font-ibm-mono)] text-xs text-[#94A3B8]">
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
