"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookmarkCheck, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboardTrade } from "@/components/layout/dashboard-trade-context";
import type { Question, RsosBlock } from "@/types";

export default function SavedQuestionsPage() {
  const trade = useDashboardTrade();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [blocks, setBlocks] = useState<RsosBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadSaved = useCallback(async () => {
    setLoading(true);
    try {
      const [bookmarksRes, blocksRes] = await Promise.all([
        fetch(`/api/bookmarks?tradeId=${encodeURIComponent(trade.id)}`),
        fetch(`/api/content/blocks?tradeId=${encodeURIComponent(trade.id)}`),
      ]);
      const bookmarksData = await bookmarksRes.json();
      const blocksData = await blocksRes.json();
      setQuestions(bookmarksData.questions ?? []);
      setBlocks(blocksData.blocks ?? []);
    } finally {
      setLoading(false);
    }
  }, [trade.id]);

  useEffect(() => {
    void loadSaved();
  }, [loadSaved]);

  const handleRemove = async (questionId: string) => {
    setRemovingId(questionId);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: questionId }),
      });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      }
    } finally {
      setRemovingId(null);
    }
  };

  const blockName = (blockId?: string) => {
    const block = blocks.find((b) => b.id === blockId);
    return block ? `Block ${block.code}` : "Unknown block";
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCEBEC] text-[#C0271E]">
          <BookmarkCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-[family-name:var(--font-barlow-semi)] text-3xl font-bold">
            Saved Questions
          </h1>
          <p className="text-[#64748B]">
            Practice questions you bookmarked — tap the bookmark icon on any
            question in Practice to save it here.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-10 flex items-center gap-2 text-[#64748B]">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading saved questions…
        </div>
      ) : questions.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-[#E5E0D8] bg-white p-10 text-center">
          <p className="font-semibold text-[#475569]">No saved questions yet</p>
          <p className="mt-2 text-sm text-[#94A3B8]">
            Open Practice, work through questions, and bookmark any you want to
            review later.
          </p>
          <Link href="/dashboard/practice" className="mt-4 inline-block">
            <Button variant="secondary" size="sm">
              Go to Practice
            </Button>
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {questions.map((question) => (
            <li
              key={question.id}
              className="rounded-xl border border-[#E5E0D8] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-[family-name:var(--font-ibm-mono)] text-xs font-medium text-[#C0271E]">
                      {blockName(question.block_id)}
                    </span>
                    <Badge className="bg-[#F6F3EE] text-[#64748B]">
                      {question.question_type}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-snug text-[#334155]">
                    {question.stem}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={removingId === question.id}
                  onClick={() => void handleRemove(question.id)}
                  aria-label="Remove bookmark"
                >
                  {removingId === question.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-[#94A3B8]" />
                  )}
                </Button>
              </div>
              <Link
                href={`/dashboard/practice?question=${encodeURIComponent(question.id)}`}
                className="mt-3 inline-block"
              >
                <Button variant="secondary" size="sm">
                  Review in practice
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
