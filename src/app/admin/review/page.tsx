"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TRADES } from "@/data/seed";
import type { ReviewDraftItem } from "@/lib/admin/draft-queue";
import type { GeneratedLesson, GeneratedQuestion } from "@/lib/ai/generate";

export default function AdminReviewPage() {
  const [items, setItems] = useState<ReviewDraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQueue = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/review");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load queue");
      setItems(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleReview = async (
    item: ReviewDraftItem,
    status: "approved" | "rejected",
  ) => {
    await fetch("/api/admin/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        content_type: item.content_type,
        status,
        related_ids: item.related_ids,
      }),
    });
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const tradeName = (tradeId: string) =>
    TRADES.find((t) => t.id === tradeId)?.name ?? tradeId;

  return (
    <div className="min-h-screen bg-[#F6F3EE] p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#C0271E]"
        >
          <ArrowLeft className="h-4 w-4" /> Admin
        </Link>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Review Queue</h1>
            <p className="text-sm text-[#64748B]">
              Approve AI-generated lessons, questions, and flashcards before
              publishing.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadQueue}>
            Refresh
          </Button>
        </div>

        {loading && (
          <p className="mt-6 text-sm text-[#64748B]">Loading drafts...</p>
        )}
        {error && <p className="mt-6 text-sm text-[#C0271E]">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <Card className="mt-6 p-6 text-sm text-[#64748B]">
            No drafts in the queue. Generate content on{" "}
            <Link
              href="/admin/generate"
              className="font-semibold text-[#C0271E]"
            >
              AI Generation
            </Link>{" "}
            first.
          </Card>
        )}

        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#FEF2F2] px-2.5 py-0.5 text-xs font-medium capitalize text-[#C0271E]">
                  {item.content_type}
                </span>
                <span className="text-xs text-[#94A3B8]">
                  {tradeName(item.trade_id)}
                  {item.block_code && ` · Block ${item.block_code}`}
                </span>
              </div>

              {item.content_type === "question" && (
                <QuestionDraft payload={item.payload as GeneratedQuestion} />
              )}
              {item.content_type === "lesson" && (
                <LessonDraft payload={item.payload as GeneratedLesson} />
              )}
              {item.content_type === "flashcard" && (
                <FlashcardDraft
                  payload={
                    item.payload as {
                      flashcards: { front: string; back: string }[];
                    }
                  }
                />
              )}

              {item.retrieved_chunks.length > 0 && (
                <div className="mt-3 rounded-lg bg-[#FFFBEB] p-3 text-xs">
                  <b>RAG citation:</b> {item.retrieved_chunks[0].rule_number} —{" "}
                  {item.retrieved_chunks[0].section_title}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleReview(item, "approved")}
                >
                  <Check className="h-4 w-4" /> Approve
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleReview(item, "rejected")}
                >
                  <X className="h-4 w-4" /> Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuestionDraft({ payload }: { payload: GeneratedQuestion }) {
  return (
    <>
      <p className="mt-3 font-semibold">{payload.stem}</p>
      <div className="mt-3 space-y-1">
        {payload.options.map((o) => (
          <div key={o.key} className="text-sm">
            <b>{o.key}.</b> {o.text}
            {o.distractor_rationale && (
              <span className="ml-2 text-xs text-[#64748B]">
                → {o.distractor_rationale}
              </span>
            )}
          </div>
        ))}
      </div>
      {payload.code_citations.length > 0 && (
        <div className="mt-3 rounded-lg bg-[#FFFBEB] p-3 text-xs">
          <b>Code:</b> {payload.code_citations[0].rule_number} —{" "}
          {payload.code_citations[0].section_title}
        </div>
      )}
    </>
  );
}

function LessonDraft({ payload }: { payload: GeneratedLesson }) {
  return (
    <>
      <h2 className="mt-3 font-semibold">{payload.title}</h2>
      {payload.summary && (
        <p className="mt-1 text-sm text-[#64748B]">{payload.summary}</p>
      )}
      <p className="mt-2 text-xs text-[#94A3B8]">
        {payload.content_blocks.length} sections · ~{payload.estimated_minutes}{" "}
        min
      </p>
      <div className="mt-4 max-h-64 space-y-3 overflow-y-auto rounded-lg border border-[#E5E0D8] p-4">
        {payload.content_blocks.map((block, i) => (
          <div key={i} className="text-sm">
            {block.type === "heading" ? (
              <p className="font-semibold">{block.content}</p>
            ) : (
              <p className="text-[#64748B]">
                <span className="font-[family-name:var(--font-ibm-mono)] text-xs uppercase text-[#94A3B8]">
                  {block.type}
                </span>
                {": "}
                {block.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function FlashcardDraft({
  payload,
}: {
  payload: { flashcards: { front: string; back: string }[] };
}) {
  return (
    <div className="mt-3 space-y-2">
      {payload.flashcards.map((card, i) => (
        <div
          key={i}
          className="rounded-lg border border-[#E5E0D8] px-3 py-2 text-sm"
        >
          <p className="font-medium">{card.front}</p>
          <p className="mt-1 text-[#64748B]">{card.back}</p>
        </div>
      ))}
    </div>
  );
}
