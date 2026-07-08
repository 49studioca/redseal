"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { QuestionCard } from "@/components/practice/question-card";
import { ReferenceViewer } from "@/components/practice/reference-viewer";
import { Button } from "@/components/ui/button";
import { useDashboardTrade } from "@/components/layout/dashboard-trade-context";
import { useDashboardPreferences } from "@/components/layout/dashboard-preferences-context";
import { ProvincialStudyBanner } from "@/components/dashboard/provincial-study-banner";
import { getProvincialStudyContext } from "@/lib/content/province-content";
import { validateDiscussionComment } from "@/lib/moderation/comment-content";
import type { Question, ReferenceChunk, RsosBlock } from "@/types";

type QuestionComment = {
  id: string;
  body: string;
  created_at: string;
  author: string;
};

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
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

export default function PracticePage() {
  const trade = useDashboardTrade();
  const { province } = useDashboardPreferences();
  const provincialContext = getProvincialStudyContext(
    trade.id,
    trade.code,
    province,
  );
  const searchParams = useSearchParams();
  const [blocks, setBlocks] = useState<RsosBlock[]>([]);
  const initialBlock = searchParams.get("block");
  const initialQuestion = searchParams.get("question");
  const [blockFilter, setBlockFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refOpen, setRefOpen] = useState(false);
  const [refChunks, setRefChunks] = useState<ReferenceChunk[]>([]);
  const [showDiscuss, setShowDiscuss] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [discussBody, setDiscussBody] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [comments, setComments] = useState<QuestionComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [discussSubmitting, setDiscussSubmitting] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [discussError, setDiscussError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [discussSuccess, setDiscussSuccess] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarkingId, setBookmarkingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bookmarks")
      .then((r) => r.json())
      .then((data) => {
        setBookmarkedIds(new Set((data.question_ids ?? []) as string[]));
      })
      .catch(() => setBookmarkedIds(new Set()));
  }, []);

  useEffect(() => {
    if (initialQuestion) {
      setBlockFilter("all");
      setTypeFilter("all");
    }
  }, [initialQuestion]);

  useEffect(() => {
    fetch(`/api/content/blocks?tradeId=${trade.id}`)
      .then((r) => r.json())
      .then((data) => {
        const loaded = (data.blocks ?? []) as RsosBlock[];
        setBlocks(loaded);
        if (
          !initialQuestion &&
          initialBlock &&
          loaded.some((b: RsosBlock) => b.id === initialBlock)
        ) {
          setBlockFilter(initialBlock);
        }
      });
  }, [trade.id, initialBlock, initialQuestion]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ tradeId: trade.id });
    if (blockFilter !== "all") params.set("blockId", blockFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    fetch(`/api/content/questions?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const loaded = (data.questions ?? []) as Question[];
        setQuestions(loaded);
        if (initialQuestion) {
          const idx = loaded.findIndex((q) => q.id === initialQuestion);
          setCurrentIndex(idx >= 0 ? idx : 0);
        } else {
          setCurrentIndex(0);
        }
      })
      .finally(() => setLoading(false));
  }, [blockFilter, typeFilter, trade.id, initialQuestion, province]);

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

  const loadComments = useCallback(async (questionId: string) => {
    setCommentsLoading(true);
    try {
      const res = await fetch(
        `/api/comments?question_id=${encodeURIComponent(questionId)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load comments");
      setComments(data.comments ?? []);
    } catch {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const closeDiscuss = useCallback(() => {
    setShowDiscuss(false);
    setDiscussBody("");
    setDiscussError(null);
    setDiscussSuccess(false);
    setComments([]);
  }, []);

  const closeReport = useCallback(() => {
    setShowReport(false);
    setReportDetails("");
    setReportReason("");
    setReportError(null);
    setReportSuccess(false);
  }, []);

  const openDiscuss = useCallback(() => {
    const q = questions[currentIndex];
    if (!q) return;
    setDiscussBody("");
    setDiscussError(null);
    setDiscussSuccess(false);
    setShowDiscuss(true);
    void loadComments(q.id);
  }, [currentIndex, loadComments, questions]);

  const openReport = useCallback(() => {
    setReportDetails("");
    setReportReason("");
    setReportError(null);
    setReportSuccess(false);
    setShowReport(true);
  }, []);

  const handleReport = async () => {
    const q = questions[currentIndex];
    if (!q || !reportReason) return;
    setReportSubmitting(true);
    setReportError(null);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: q.id,
          reason: reportReason,
          details: reportDetails.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit report");
      setReportSuccess(true);
      setReportDetails("");
      setReportReason("");
    } catch (err) {
      setReportError((err as Error).message);
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleComment = async () => {
    const q = questions[currentIndex];
    if (!q || !discussBody.trim()) return;

    const moderation = validateDiscussionComment(discussBody);
    if (!moderation.ok) {
      setDiscussError(moderation.message);
      return;
    }

    setDiscussSubmitting(true);
    setDiscussError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: q.id, body: discussBody.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not post comment");
      setDiscussBody("");
      setDiscussSuccess(true);
      await loadComments(q.id);
    } catch (err) {
      setDiscussError((err as Error).message);
    } finally {
      setDiscussSubmitting(false);
    }
  };

  const handleAnswer = useCallback(
    (_option: string, isCorrect: boolean) => {
      const q = questions[currentIndex];
      if (!q?.block_id) return;
      void fetch("/api/progress/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trade_id: trade.id,
          block_id: q.block_id,
          is_correct: isCorrect,
        }),
      });
    },
    [currentIndex, questions, trade.id],
  );

  const handleBookmarkToggle = useCallback(async () => {
    const q = questions[currentIndex];
    if (!q || bookmarkingId === q.id) return;

    setBookmarkingId(q.id);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: q.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save bookmark");

      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (data.bookmarked) next.add(q.id);
        else next.delete(q.id);
        return next;
      });
    } catch {
      // Keep UI unchanged on failure
    } finally {
      setBookmarkingId(null);
    }
  }, [bookmarkingId, currentIndex, questions]);

  const currentQuestion = questions[currentIndex];

  return (
    <div className="mx-auto flex max-w-[1180px] gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
          Practice Mode
        </h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Full practice bank for each block — tailored to{" "}
          {provincialContext.provinceName}. Mock exams sample the official{" "}
          {trade.exam_question_count}
          -question blueprint.
        </p>

        <div className="mt-4">
          <ProvincialStudyBanner
            context={provincialContext}
            tradeSlug={trade.slug}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
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
                onDiscuss={openDiscuss}
                onReport={openReport}
                onBookmarkToggle={() => void handleBookmarkToggle()}
                bookmarked={
                  currentQuestion
                    ? bookmarkedIds.has(currentQuestion.id)
                    : false
                }
                bookmarking={bookmarkingId === currentQuestion.id}
                onAnswer={handleAnswer}
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

        <ModalBackdrop open={showDiscuss} onClose={closeDiscuss}>
          <h3 className="font-semibold">Discuss this question</h3>
          <p className="mt-1 text-sm text-[#64748B]">
            Share a mnemonic or study tip for this question only. Do not post
            contact info, links, social handles, or inappropriate language.
          </p>

          {commentsLoading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-[#64748B]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading discussion…
            </div>
          ) : comments.length > 0 ? (
            <ul className="mt-4 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-[#E5E0D8] bg-[#F6F3EE] p-3">
              {comments.map((comment) => (
                <li key={comment.id} className="text-sm">
                  <span className="font-semibold text-[#475569]">
                    {comment.author}
                  </span>
                  <p className="mt-0.5 text-[#334155]">{comment.body}</p>
                </li>
              ))}
            </ul>
          ) : null}

          <textarea
            value={discussBody}
            onChange={(e) => {
              setDiscussBody(e.target.value);
              if (discussError) setDiscussError(null);
            }}
            maxLength={500}
            className="mt-3 w-full rounded-lg border border-[#E5E0D8] p-3 text-sm outline-none focus:border-[#C0271E] focus:ring-1 focus:ring-[#C0271E]/30"
            rows={4}
            placeholder="Share your mnemonic or interpretation..."
          />
          {discussError && (
            <p className="mt-2 text-sm text-[#C0271E]">{discussError}</p>
          )}
          {discussSuccess && (
            <p className="mt-2 text-sm text-[#047857]">
              Comment posted — thanks for helping other apprentices.
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => void handleComment()}
              disabled={discussSubmitting || !discussBody.trim()}
            >
              {discussSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Post"
              )}
            </Button>
            <Button variant="ghost" onClick={closeDiscuss}>
              {discussSuccess ? "Done" : "Cancel"}
            </Button>
          </div>
        </ModalBackdrop>

        <ModalBackdrop open={showReport} onClose={closeReport}>
          <h3 className="font-semibold">Report an error</h3>
          <p className="mt-1 text-sm text-[#64748B]">
            Flag a wrong answer, outdated code reference, or unclear wording.
          </p>
          <select
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="mt-3 w-full rounded-lg border border-[#E5E0D8] p-2 text-sm outline-none focus:border-[#C0271E] focus:ring-1 focus:ring-[#C0271E]/30"
          >
            <option value="">Select reason...</option>
            <option value="wrong_answer">Wrong answer key</option>
            <option value="outdated_code">Outdated code reference</option>
            <option value="unclear">Unclear question</option>
            <option value="other">Other</option>
          </select>
          <textarea
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
            className="mt-3 w-full rounded-lg border border-[#E5E0D8] p-3 text-sm outline-none focus:border-[#C0271E] focus:ring-1 focus:ring-[#C0271E]/30"
            rows={3}
            placeholder="Details (optional)..."
          />
          {reportError && (
            <p className="mt-2 text-sm text-[#C0271E]">{reportError}</p>
          )}
          {reportSuccess && (
            <p className="mt-2 text-sm text-[#047857]">
              Report submitted — our team will review this question.
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => void handleReport()}
              disabled={reportSubmitting || !reportReason}
            >
              {reportSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Submit report"
              )}
            </Button>
            <Button variant="ghost" onClick={closeReport}>
              {reportSuccess ? "Done" : "Cancel"}
            </Button>
          </div>
        </ModalBackdrop>
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
