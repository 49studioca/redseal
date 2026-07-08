"use client";

import { useState } from "react";
import { Search, X, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReferenceChunk } from "@/types";

interface ReferenceViewerProps {
  open: boolean;
  onClose: () => void;
  chunks: ReferenceChunk[];
  onSearch: (query: string) => void;
  highlightRule?: string;
}

export function ReferenceViewer({
  open,
  onClose,
  chunks,
  onSearch,
  highlightRule,
}: ReferenceViewerProps) {
  const [query, setQuery] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[#E5E0D8] bg-white shadow-2xl md:relative md:max-w-sm">
      <div className="flex items-center gap-2 border-b border-[#E5E0D8] bg-[#1F2A37] px-4 py-3 text-white">
        <BookOpen className="h-5 w-5 text-[#F4A11A]" />
        <span className="font-[family-name:var(--font-barlow-semi)] font-semibold">
          Reference Book
        </span>
        <button
          onClick={onClose}
          className="ml-auto rounded-lg p-1 hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-[#E5E0D8] p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Search rules, tables..."
            className="h-10 w-full rounded-lg border border-[#E5E0D8] pl-9 pr-3 text-sm focus:border-[#C0271E] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {chunks.length === 0 ? (
          <p className="text-center text-sm text-[#94A3B8]">
            Search the code book...
          </p>
        ) : (
          chunks.map((chunk) => (
            <div
              key={chunk.id}
              className={cn(
                "mb-3 rounded-lg border p-3 text-sm",
                highlightRule === chunk.rule_number
                  ? "border-[#F4A11A] bg-[#FFFBEB]"
                  : "border-[#E5E0D8] bg-[#F6F3EE]",
              )}
            >
              <div className="font-[family-name:var(--font-ibm-mono)] text-xs font-semibold text-[#C0271E]">
                Rule {chunk.rule_number}
              </div>
              {chunk.section_title && (
                <div className="mt-0.5 text-xs font-semibold text-[#64748B]">
                  {chunk.section_title}
                </div>
              )}
              <p className="mt-2 leading-relaxed text-[#475569]">
                {chunk.content}
              </p>
              {chunk.page_number && (
                <div className="mt-2 font-[family-name:var(--font-ibm-mono)] text-[10px] text-[#94A3B8]">
                  p. {chunk.page_number} · {chunk.code_version}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
