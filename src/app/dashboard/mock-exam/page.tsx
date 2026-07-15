"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { QuestionCard } from "@/components/practice/question-card";
import { ReferenceViewer } from "@/components/practice/reference-viewer";
import { Button } from "@/components/ui/button";
import { UpgradeButton } from "@/components/subscription/upgrade-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboardTrade } from "@/components/layout/dashboard-trade-context";
import { useDashboardPreferences } from "@/components/layout/dashboard-preferences-context";
import { FREE_LIMITS } from "@/lib/access/subscription";
import {
  buildBlueprint,
  sampleQuestionsForMockExam,
  calculateExamScore,
} from "@/lib/mock-exam/engine";
import { trackEvent } from "@/lib/analytics/track-event";
import { cn } from "@/lib/utils";
import type { Question, ReferenceChunk, RsosBlock } from "@/types";

type Phase = "intro" | "exam" | "results";

export default function MockExamPage() {
  const trade = useDashboardTrade();
  const { province, isPremium } = useDashboardPreferences();
  const [blocks, setBlocks] = useState<RsosBlock[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(trade.exam_time_minutes * 60);
  const [refOpen, setRefOpen] = useState(false);
  const [refChunks, setRefChunks] = useState<ReferenceChunk[]>([]);
  const [results, setResults] = useState<ReturnType<
    typeof calculateExamScore
  > | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<"all" | "wrong" | "skipped">(
    "all",
  );

  useEffect(() => {
    Promise.all([
      fetch(`/api/content/blocks?tradeId=${trade.id}`).then((r) => r.json()),
      fetch(`/api/content/questions?tradeId=${trade.id}`).then((r) => r.json()),
    ]).then(([blockData, questionData]) => {
      setBlocks(blockData.blocks ?? []);
      setAllQuestions(questionData.questions ?? []);
    });
  }, [trade.id, province]);

  useEffect(() => {
    if (phase !== "exam") return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const startExam = () => {
    const blueprint = buildBlueprint(blocks, trade.exam_question_count);
    const sampled = sampleQuestionsForMockExam(allQuestions, blueprint, blocks);
    const examQuestions = isPremium
      ? sampled
      : sampled.slice(0, FREE_LIMITS.mockExamQuestions);
    setQuestions(examQuestions);
    setAnswers({});
    setCurrentIndex(0);
    setReviewing(false);
    setReviewIndex(0);
    setReviewFilter("all");
    setTimeLeft(
      isPremium
        ? trade.exam_time_minutes * 60
        : FREE_LIMITS.mockExamQuestions * 120,
    );
    setPhase("exam");
    trackEvent("start_mock_exam", {
      trade_id: trade.id,
      trade_slug: trade.slug,
      is_premium: isPremium,
      question_count: examQuestions.length,
    });
  };

  const reviewStats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    for (const question of questions) {
      const answer = answers[question.id];
      if (!answer) skipped += 1;
      else if (answer === question.correct_option) correct += 1;
      else wrong += 1;
    }

    return { correct, wrong, skipped };
  }, [questions, answers]);

  const filteredReviewQuestions = useMemo(() => {
    if (reviewFilter === "all") return questions;

    return questions.filter((question) => {
      const answer = answers[question.id];
      if (reviewFilter === "skipped") return !answer;
      return Boolean(answer && answer !== question.correct_option);
    });
  }, [questions, answers, reviewFilter]);

  useEffect(() => {
    if (reviewIndex >= filteredReviewQuestions.length) {
      setReviewIndex(Math.max(0, filteredReviewQuestions.length - 1));
    }
  }, [filteredReviewQuestions.length, reviewIndex]);

  const finishExam = useCallback(() => {
    const res = calculateExamScore(questions, answers);
    setResults(res);
    setPhase("results");
    trackEvent("complete_mock_exam", {
      trade_id: trade.id,
      trade_slug: trade.slug,
      score: res.score,
      passed: res.passed,
      question_count: questions.length,
      is_premium: isPremium,
    });
    void fetch("/api/progress/mock-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trade_id: trade.id,
        block_scores: res.blockScores,
      }),
    });
  }, [questions, answers, trade.id, trade.slug, isPremium]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setRefChunks([]);
      return;
    }
    const res = await fetch(
      `/api/reference/search?q=${encodeURIComponent(query)}`,
    );
    const data = await res.json();
    setRefChunks(data.chunks ?? []);
  };

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
          Mock Exam
        </h1>
        <Card className="mt-5 p-5 sm:mt-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold">
            {trade.name}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[#64748B]">
            {isPremium ? (
              <>
                <li>
                  • {trade.exam_question_count} questions — official exam format
                </li>
                <li>
                  • {trade.exam_time_minutes / 60} hour time limit — matches
                  exam day
                </li>
              </>
            ) : (
              <>
                <li>
                  • {FREE_LIMITS.mockExamQuestions} question preview — free tier
                </li>
                <li>
                  • Upgrade for the full {trade.exam_question_count}-question
                  exam
                </li>
              </>
            )}
            <li>
              • RSOS block weights match the real exam (not the practice bank
              size)
            </li>
            <li>• {trade.pass_percentage}% required to pass</li>
            {trade.is_open_book && (
              <li>• Open-book: reference viewer available</li>
            )}
          </ul>
          <Button className="mt-8" size="lg" onClick={startExam}>
            {isPremium ? "Start mock exam" : "Start free preview"}
          </Button>
          {!isPremium && (
            <p className="mt-4 text-sm text-[#64748B]">
              <UpgradeButton
                label="Upgrade"
                showLockIcon={false}
                variant="ghost"
                className="inline-flex h-auto p-0 align-baseline font-medium text-[#C0271E] hover:bg-transparent hover:underline"
              />{" "}
              for unlimited full-length mock exams.
            </p>
          )}
        </Card>
      </div>
    );
  }

  if (phase === "results" && results) {
    const reviewQuestion = filteredReviewQuestions[reviewIndex];

    if (reviewing) {
      return (
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
                Review answers
              </h1>
              <p className="mt-1 text-sm text-[#64748B]">
                {reviewStats.correct} correct · {reviewStats.wrong} wrong ·{" "}
                {reviewStats.skipped} skipped
              </p>
            </div>
            <Button variant="secondary" onClick={() => setReviewing(false)}>
              Back to summary
            </Button>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["wrong", "Wrong"],
                ["skipped", "Skipped"],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                size="sm"
                variant={reviewFilter === key ? "primary" : "secondary"}
                onClick={() => {
                  setReviewFilter(key);
                  setReviewIndex(0);
                }}
              >
                {label}
              </Button>
            ))}
          </div>

          {reviewQuestion ? (
            <>
              <QuestionCard
                question={reviewQuestion}
                questionNumber={
                  questions.findIndex((q) => q.id === reviewQuestion.id) + 1
                }
                totalQuestions={questions.length}
                showReference={trade.is_open_book}
                onOpenReference={() => setRefOpen(true)}
                initialSelected={answers[reviewQuestion.id] ?? null}
                readOnly
                revealAnswer
              />
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="secondary"
                  disabled={reviewIndex === 0}
                  onClick={() => setReviewIndex((i) => i - 1)}
                >
                  Previous
                </Button>
                <span className="font-[family-name:var(--font-ibm-mono)] text-sm text-[#64748B]">
                  {reviewIndex + 1} of {filteredReviewQuestions.length}
                </span>
                <Button
                  disabled={reviewIndex >= filteredReviewQuestions.length - 1}
                  onClick={() => setReviewIndex((i) => i + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <Card className="p-5 text-center text-sm text-[#64748B] sm:p-8">
              No questions match this filter.
            </Card>
          )}

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

    return (
      <div className="mx-auto max-w-2xl">
        <Card
          className={`p-5 text-center sm:p-8 ${results.passed ? "border-[#10B981]" : "border-[#EF4444]"}`}
        >
          <div className="font-[family-name:var(--font-barlow-condensed)] text-6xl font-bold">
            {results.score.toFixed(1)}%
          </div>
          <div
            className={`mt-2 text-xl font-bold ${results.passed ? "text-[#047857]" : "text-[#B91C1C]"}`}
          >
            {results.passed ? "PASS" : "FAIL"} — {trade.pass_percentage}%
            required
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Badge className="bg-[#ECFDF5] text-[#047857]">
              {reviewStats.correct} correct
            </Badge>
            <Badge className="bg-[#FEF2F2] text-[#B91C1C]">
              {reviewStats.wrong} wrong
            </Badge>
            <Badge className="bg-[#F1F5F9] text-[#64748B]">
              {reviewStats.skipped} skipped
            </Badge>
          </div>

          <h3 className="mt-8 text-left font-semibold">Score by block</h3>
          <div className="mt-3 space-y-2">
            {Object.entries(results.blockScores).map(([blockId, scores]) => {
              const block = blocks.find((b) => b.id === blockId);
              const pct = scores.total
                ? (scores.correct / scores.total) * 100
                : 0;
              return (
                <div
                  key={blockId}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    Block {block?.code ?? "?"} — {block?.name.slice(0, 40)}
                  </span>
                  <span className="font-[family-name:var(--font-ibm-mono)] font-semibold">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => {
                setReviewFilter("all");
                setReviewIndex(0);
                setReviewing(true);
              }}
            >
              Review all questions
            </Button>
            {reviewStats.wrong > 0 && (
              <Button
                variant="secondary"
                onClick={() => {
                  setReviewFilter("wrong");
                  setReviewIndex(0);
                  setReviewing(true);
                }}
              >
                Review wrong answers
              </Button>
            )}
            <Button variant="secondary" onClick={() => setPhase("intro")}>
              Take another exam
            </Button>
          </div>
        </Card>

        <div className="mt-6">
          <h3 className="font-[family-name:var(--font-barlow-semi)] text-lg font-bold">
            Question breakdown
          </h3>
          <div className="mt-3 grid grid-cols-5 gap-2 min-[390px]:grid-cols-6 sm:grid-cols-10 md:grid-cols-12">
            {questions.map((question, index) => {
              const answer = answers[question.id];
              const status = !answer
                ? "skipped"
                : answer === question.correct_option
                  ? "correct"
                  : "wrong";

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => {
                    setReviewFilter("all");
                    setReviewIndex(index);
                    setReviewing(true);
                  }}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-md font-[family-name:var(--font-ibm-mono)] text-xs font-bold transition hover:ring-2 hover:ring-[#C0271E]/30",
                    status === "correct" && "bg-[#ECFDF5] text-[#047857]",
                    status === "wrong" && "bg-[#FEF2F2] text-[#B91C1C]",
                    status === "skipped" && "bg-[#F1F5F9] text-[#64748B]",
                  )}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <div className="mx-auto flex max-w-[1180px] gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-4 grid grid-cols-2 items-center gap-2 rounded-xl bg-[#1F2A37] px-3 py-3 text-white sm:flex sm:justify-between sm:px-4 sm:py-2">
          <span className="font-[family-name:var(--font-ibm-mono)] text-sm">
            {formatTime(timeLeft)} remaining
          </span>
          <span className="text-sm">
            {Object.keys(answers).length} / {questions.length} answered
          </span>
          <Button
            className="col-span-2 sm:col-span-1"
            size="sm"
            variant="white"
            onClick={finishExam}
          >
            Submit exam
          </Button>
        </div>
        <QuestionCard
          question={q}
          questionNumber={currentIndex + 1}
          totalQuestions={questions.length}
          showReference={trade.is_open_book}
          onOpenReference={() => setRefOpen(true)}
          initialSelected={answers[q.id] ?? null}
          hideResults
          onAnswer={(option) => setAnswers((a) => ({ ...a, [q.id]: option }))}
        />
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
            Next
          </Button>
        </div>
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
