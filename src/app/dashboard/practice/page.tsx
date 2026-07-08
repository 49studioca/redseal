"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { QuestionCard } from "@/components/practice/question-card";
import { ReferenceViewer } from "@/components/practice/reference-viewer";
import { Button } from "@/components/ui/button";
import { useDashboardTrade } from "@/components/layout/dashboard-trade-context";
import type { Question, ReferenceChunk, RsosBlock } from "@/types";

export default function PracticePage() {
  const trade = useDashboardTrade();
  const searchParams = useSearchParams();
  const [blocks, setBlocks] = useState<RsosBlock[]>([]);
  const initialBlock = searchParams.get("block");
  const [blockFilter, setBlockFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refOpen, setRefOpen] = useState(false);
  const [refChunks, setRefChunks] = useState<ReferenceChunk[]>([]);
  const [showDiscuss, setShowDiscuss] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [comment, setComment] = useState("");
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    fetch(`/api/content/blocks?tradeId=${trade.id}`)
      .then((r) => r.json())
      .then((data) => {
        const loaded = (data.blocks ?? []) as RsosBlock[];
        setBlocks(loaded);
        if (
          initialBlock &&
          loaded.some((b: RsosBlock) => b.id === initialBlock)
        ) {
          setBlockFilter(initialBlock);
        }
      });
  }, [trade.id, initialBlock]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ tradeId: trade.id });
    if (blockFilter !== "all") params.set("blockId", blockFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    fetch(`/api/content/questions?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions ?? []);
        setCurrentIndex(0);
      })
      .finally(() => setLoading(false));
  }, [blockFilter, typeFilter, trade.id]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setRefChunks([]);
      return;
    }
    const res = await fetch(
      `/api/reference/search?q=${encodeURIComponent(query)}`,
    );
    const data = await res.json();
    setRefChunks(data.chunks ?? []);
  }, []);

  const handleReport = async () => {
    const q = questions[currentIndex];
    if (!q) return;
    await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_id: q.id,
        reason: reportReason,
        details: comment,
      }),
    });
    setShowReport(false);
    setReportReason("");
    setComment("");
  };

  const handleComment = async () => {
    const q = questions[currentIndex];
    if (!q || !comment.trim()) return;
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: q.id, body: comment }),
    });
    setShowDiscuss(false);
    setComment("");
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="mx-auto flex max-w-[1180px] gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
          Practice Mode
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Full practice bank for each block — not limited to exam question
          counts. Mock exams sample the official {trade.exam_question_count}
          -question blueprint.
        </p>

        <div className="mt-4 flex flex-wrap gap--2">
          <select
            value={blockFilter}
            onChange={(e) => setBlockFilter(e.target.value)}
            className="h-9 rounded-lg border border-[#E5E0D8] bg-white px-3 text-sm"
          >
            <option value="all">All blocks</option>
            {blocks.map((b) => (
              <option key={b.id} value={b.id}>
                Block {b.code}: {b.name.slice(0, 30)}...
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-lg border border-[#E5E0D8] bg-white px-3 text-sm"
          >
            <option value="all">All types</option>
            <option value="recall">Knowledge & Recall</option>
            <option value="application">Procedural & Application</option>
            <option value="critical">Critical Thinking</option>
          </select>
        </div>

        {currentQuestion ? (
          <>
            <div className="mt-6">
              <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={questions.length}
                showReference={trade.is_open_book}
                onOpenReference={() => setRefOpen(true)}
                onDiscuss={() => setShowDiscuss(true)}
                onReport={() => setShowReport(true)}
              />
            </div>
            <div className="mt-4 flex justify-between">
              <Button
                variant="secondary"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
              >
                Previous
              </Button>
              <Button
                disabled={currentIndex >= questions.length - 1}
                onClick={() => setCurrentIndex((i) => i + 1)}
              >
                Next question
              </Button>
            </div>
          </>
        ) : loading ? (
          <p className="mt-8 text-[#64748B]">Loading questions...</p>
        ) : (
          <p className="mt-8 text-[#64748B]">
            No questions match your filters. Run{" "}
            <code className="rounded bg-[#F1F5F9] px-1">
              npm run db:generate-content
            </code>{" "}
            to generate AI questions.
          </p>
        )}

        {showDiscuss && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6">
              <h3 className="font-semibold">Discuss this question</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-3 w-full rounded-lg border border-[#E5E0D8] p-3 text-sm"
                rows={4}
                placeholder="Share your mnemonic or interpretation..."
              />
              <div className="mt-4 flex gap-2">
                <Button onClick={handleComment}>Post</Button>
                <Button variant="ghost" onClick={() => setShowDiscuss(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {showReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6">
              <h3 className="font-semibold">Report an error</h3>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="mt-3 w-full rounded-lg border border-[#E5E0D8] p-2 text-sm"
              >
                <option value="">Select reason...</option>
                <option value="wrong_answer">Wrong answer key</option>
                <option value="outdated_code">Outdated code reference</option>
                <option value="unclear">Unclear question</option>
                <option value="other">Other</option>
              </select>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-3 w-full rounded-lg border border-[#E5E0D8] p-3 text-sm"
                rows={3}
                placeholder="Details..."
              />
              <div className="mt-4 flex gap-2">
                <Button onClick={handleReport} disabled={!reportReason}>
                  Submit report
                </Button>
                <Button variant="ghost" onClick={() => setShowReport(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {trade.is_open_book && (
        <ReferenceViewer
          open={refOpen}
          onClose={() => setRefOpen(false)}
          chunks={refChunks}
          onSearch={handleSearch}
        />
      )}
    </div>
  );
}
