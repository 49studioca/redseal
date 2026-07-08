"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TRADES,
  getBlocksForTrade,
  getChapterTasksForBlock,
  getDefaultCodeVersion,
} from "@/data/seed";
import { computePracticeQuestionCount } from "@/lib/content/practice-questions";

export default function AdminGeneratePage() {
  const [tradeId, setTradeId] = useState(TRADES[0].id);
  const [jobType, setJobType] = useState("lesson");
  const [questionCount, setQuestionCount] = useState<number | "">("");
  const [appendQuestions, setAppendQuestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const chapters = useMemo(() => getBlocksForTrade(tradeId), [tradeId]);
  const [blockId, setBlockId] = useState(chapters[0]?.id ?? "");

  const effectiveBlockId =
    blockId && chapters.some((b) => b.id === blockId)
      ? blockId
      : (chapters[0]?.id ?? "");

  const selectedChapter = chapters.find((b) => b.id === effectiveBlockId);
  const chapterTasks = selectedChapter
    ? getChapterTasksForBlock(selectedChapter.id)
    : [];
  const codeVersion = getDefaultCodeVersion(tradeId);
  const defaultPracticeCount = selectedChapter
    ? computePracticeQuestionCount(
        chapterTasks,
        selectedChapter.exam_question_count,
      )
    : 0;

  const handleTradeChange = (nextTradeId: string) => {
    setTradeId(nextTradeId);
    const nextChapters = getBlocksForTrade(nextTradeId);
    setBlockId(nextChapters[0]?.id ?? "");
    setResult(null);
  };

  const handleGenerate = async () => {
    if (!selectedChapter) return;
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/admin/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trade_id: tradeId,
        job_type: jobType,
        block_id: selectedChapter.id,
        block_name: selectedChapter.name,
        subtask_name: chapterTasks[0]?.name,
        question_type: "application",
        difficulty: 3,
        code_version: codeVersion,
        question_count:
          jobType === "practice_bank" && questionCount !== ""
            ? questionCount
            : undefined,
        append_questions:
          jobType === "practice_bank" ? appendQuestions : undefined,
      }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#C0271E]"
        >
          <ArrowLeft className="h-4 w-4" /> Admin
        </Link>
        <h1 className="mt-4 flex items-center gap-2 font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
          <Sparkles className="h-6 w-6 text-[#F4A11A]" /> AI Generation
        </h1>
        <p className="mt-2 text-sm text-[#64748B]">
          Generate deep teaching lessons and practice question banks. Practice
          targets cover all RSOS tasks; mock exams use official exam counts
          only.
        </p>

        <Card className="mt-6 space-y-4 p-6">
          <div>
            <label className="text-sm font-semibold">Trade</label>
            <select
              value={tradeId}
              onChange={(e) => handleTradeChange(e.target.value)}
              className="mt-1 w-full rounded-lg border p-2"
            >
              {TRADES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">
              Chapter (RSOS block)
            </label>
            <select
              value={effectiveBlockId}
              onChange={(e) => {
                setBlockId(e.target.value);
                setResult(null);
              }}
              className="mt-1 w-full rounded-lg border p-2"
            >
              {chapters.map((b) => (
                <option key={b.id} value={b.id}>
                  Block {b.code} — {b.name.slice(0, 30)}... (exam{" "}
                  {b.exam_question_count} Qs)
                </option>
              ))}
            </select>
          </div>

          {selectedChapter && chapterTasks.length > 0 && (
            <div className="rounded-lg bg-[#F8FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
                Tasks in this chapter
              </p>
              <ul className="mt-2 space-y-1">
                {chapterTasks.map((task) => (
                  <li
                    key={task.code}
                    className="flex justify-between text-sm text-[#475569]"
                  >
                    <span>
                      <span className="font-[family-name:var(--font-ibm-mono)] text-xs text-[#C0271E]">
                        {task.code}
                      </span>{" "}
                      {task.name}
                    </span>
                    <span className="font-[family-name:var(--font-ibm-mono)] text-xs text-[#94A3B8]">
                      {task.exam_question_count} exam Qs
                    </span>
                  </li>
                ))}
              </ul>
              {jobType === "lesson" && (
                <p className="mt-3 text-xs text-[#64748B]">
                  Lesson will include a section for each task above.
                </p>
              )}
              {jobType === "flashcard" && (
                <p className="mt-3 text-xs text-[#64748B]">
                  Requires an existing lesson for this block. Generate the
                  chapter lesson first, then create flashcards from it.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold">Content type</label>
            <select
              value={jobType}
              onChange={(e) => {
                setJobType(e.target.value);
                setResult(null);
              }}
              className="mt-1 w-full rounded-lg border p-2"
            >
              <option value="lesson">Lesson (chapter-based)</option>
              <option value="practice_bank">
                Practice question bank (full block)
              </option>
              <option value="question">
                Single question draft (review queue)
              </option>
              <option value="flashcard">
                Flashcards (from chapter lesson)
              </option>
            </select>
          </div>

          {jobType === "practice_bank" && selectedChapter && (
            <div className="space-y-3 rounded-lg bg-[#F8FAFC] p-4">
              <p className="text-sm text-[#475569]">
                Default practice target: <b>{defaultPracticeCount}</b> questions
                (exam uses {selectedChapter.exam_question_count}). Distributed
                across all RSOS tasks in this block.
              </p>
              <div>
                <label className="text-sm font-semibold">
                  Question count (optional override)
                </label>
                <input
                  type="number"
                  min={1}
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(
                      e.target.value === ""
                        ? ""
                        : Number.parseInt(e.target.value, 10),
                    )
                  }
                  placeholder={String(defaultPracticeCount)}
                  className="mt-1 w-full rounded-lg border p-2"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#475569]">
                <input
                  type="checkbox"
                  checked={appendQuestions}
                  onChange={(e) => setAppendQuestions(e.target.checked)}
                />
                Append to existing bank (do not delete current questions)
              </label>
            </div>
          )}

          <p className="text-xs text-[#94A3B8]">Code version: {codeVersion}</p>

          <Button
            onClick={handleGenerate}
            disabled={loading || !selectedChapter}
          >
            {loading
              ? "Generating..."
              : jobType === "lesson"
                ? "Generate chapter lesson"
                : jobType === "practice_bank"
                  ? appendQuestions
                    ? "Add practice questions"
                    : "Generate practice bank"
                  : jobType === "flashcard"
                    ? "Generate flashcards from lesson"
                    : "Generate content"}
          </Button>
        </Card>

        {result && (
          <Card className="mt-6 p-6">
            <h3 className="font-semibold">Generated output (draft)</h3>
            {"draft_id" in result && (
              <p className="mt-2 text-sm text-[#10B981]">
                Saved to review queue.{" "}
                <Link
                  href="/admin/review"
                  className="font-semibold text-[#C0271E]"
                >
                  Open queue →
                </Link>
              </p>
            )}
            {"flashcard_ids" in result &&
              Array.isArray(result.flashcard_ids) && (
                <p className="mt-2 text-sm text-[#10B981]">
                  Published {result.flashcard_ids.length} flashcards from{" "}
                  {String(result.lesson_title ?? "the chapter lesson")}. View
                  them in{" "}
                  <Link
                    href="/dashboard/flashcards"
                    className="font-semibold text-[#C0271E]"
                  >
                    Flashcards
                  </Link>
                  .
                </p>
              )}
            {"question_ids" in result && Array.isArray(result.question_ids) && (
              <p className="mt-2 text-sm text-[#10B981]">
                Published {result.question_ids.length} practice questions to the
                bank (exam blueprint still uses{" "}
                {String(result.exam_question_count ?? "?")} per block).
              </p>
            )}
            {"error" in result && (
              <p className="mt-2 text-sm text-[#C0271E]">
                {String(result.error)}
              </p>
            )}
            <pre className="mt-3 overflow-x-auto rounded-lg bg-[#1F2A37] p-4 text-xs text-[#CFE0EE]">
              {JSON.stringify(result, null, 2)}
            </pre>
            <p className="mt-3 text-sm text-[#64748B]">
              Review in the Review Queue before publishing.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
