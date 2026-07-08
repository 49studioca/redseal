"use client";

import { useState, useEffect, useCallback } from "react";
import { QuestionCard } from "@/components/practice/question-card";
import { ReferenceViewer } from "@/components/practice/reference-viewer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDashboardTrade } from "@/components/layout/dashboard-trade-context";
import {
  buildBlueprint,
  sampleQuestionsForMockExam,
  calculateExamScore,
} from "@/lib/mock-exam/engine";
import type { Question, ReferenceChunk, RsosBlock } from "@/types";

type Phase = "intro" | "exam" | "results";

export default function MockExamPage() {
  const trade = useDashboardTrade();
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

  useEffect(() => {
    Promise.all([
      fetch(`/api/content/blocks?tradeId=${trade.id}`).then((r) => r.json()),
      fetch(`/api/content/questions?tradeId=${trade.id}`).then((r) => r.json()),
    ]).then(([blockData, questionData]) => {
      setBlocks(blockData.blocks ?? []);
      setAllQuestions(questionData.questions ?? []);
    });
  }, [trade.id]);

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
    setQuestions(sampled);
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(trade.exam_time_minutes * 60);
    setPhase("exam");
  };

  const finishExam = useCallback(() => {
    const res = calculateExamScore(questions, answers);
    setResults(res);
    setPhase("results");
  }, [questions, answers]);

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
        <Card className="mt-6 p-8">
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold">
            {trade.name}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[#64748B]">
            <li>
              • {trade.exam_question_count} questions — official exam format
            </li>
            <li>
              • {trade.exam_time_minutes / 60} hour time limit — matches exam
              day
            </li>
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
            Start mock exam
          </Button>
        </Card>
      </div>
    );
  }

  if (phase === "results" && results) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card
          className={`p-8 text-center ${results.passed ? "border-[#10B981]" : "border-[#EF4444]"}`}
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
          <Button className="mt-8" onClick={() => setPhase("intro")}>
            Take another exam
          </Button>
        </Card>
      </div>
    );
  }

  const q = questions[currentIndex];
  if (!q) return null;

  return (
    <div className="mx-auto flex max-w-[1180px] gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex items-center justify-between rounded-lg bg-[#1F2A37] px-4 py-2 text-white">
          <span className="font-[family-name:var(--font-ibm-mono)] text-sm">
            {formatTime(timeLeft)} remaining
          </span>
          <span className="text-sm">
            {Object.keys(answers).length} / {questions.length} answered
          </span>
          <Button size="sm" variant="white" onClick={finishExam}>
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
