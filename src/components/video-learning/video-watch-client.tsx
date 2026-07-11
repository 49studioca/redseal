"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";
import { LessonVideo } from "@/components/learn/lesson-video";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BlockVideoQuestion } from "@/types";
import type { VideoWithMeta } from "@/components/video-learning/video-learning-list";
import { VideoAboutCard } from "@/components/video-learning/video-about-card";
import { cleanYoutubeTitle } from "@/lib/youtube/title";

interface VideoWatchClientProps {
  video: VideoWithMeta;
  blockLabel?: string;
  startRewatch?: boolean;
}

export function VideoWatchClient({
  video,
  blockLabel,
  startRewatch = false,
}: VideoWatchClientProps) {
  const displayTitle = cleanYoutubeTitle(video.title);
  const [phase, setPhase] = useState<"watch" | "quiz" | "done">(
    startRewatch || !video.progress?.completed ? "watch" : "done",
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const questions = video.questions;
  const activeQuestion = questions[currentQ];

  const score = questions.reduce((sum, q) => {
    return sum + (answers[q.id] === q.correct_option ? 1 : 0);
  }, 0);

  const hasLocalAnswers = Object.keys(answers).length > 0;
  const resultScore = hasLocalAnswers
    ? score
    : (video.progress?.questions_correct ?? score);
  const totalQuestions = questions.length;
  const isPerfect = totalQuestions > 0 && resultScore === totalQuestions;
  const isFailed = totalQuestions > 0 && resultScore === 0;

  const allAnswered =
    questions.length > 0 && questions.every((q) => answers[q.id] !== undefined);

  const saveProgress = useCallback(
    async (completed: boolean) => {
      setSaving(true);
      try {
        await fetch(`/api/block-videos/${video.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questions_attempted: Object.keys(answers).length,
            questions_correct: score,
            completed,
          }),
        });
      } finally {
        setSaving(false);
      }
    },
    [answers, score, video.id],
  );

  const handleSelect = (questionId: string, option: string) => {
    if (revealed[questionId]) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    setRevealed((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleFinishQuiz = async () => {
    await saveProgress(true);
    setPhase("done");
  };

  const handleWatchAgain = () => {
    setPhase("watch");
    setCurrentQ(0);
    setAnswers({});
    setRevealed({});
  };

  return (
    <div className="mx-auto max-w-[860px]">
      <Link
        href="/dashboard/video-learning"
        className="inline-flex items-center gap-1 text-sm font-semibold text-[#C0271E]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Video Learning
      </Link>

      <div className="mt-4">
        {blockLabel && (
          <span className="font-[family-name:var(--font-ibm-mono)] text-xs font-medium text-[#C0271E]">
            {blockLabel}
          </span>
        )}
        {video.topic_label && (
          <p className="text-xs font-semibold uppercase tracking-wide text-[#F4A11A]">
            {video.topic_label}
          </p>
        )}
        <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
          {displayTitle}
        </h1>
      </div>

      {phase === "watch" && (
        <div className="mt-6 space-y-4">
          <LessonVideo content={video.youtube_id} title={displayTitle} />
          <VideoAboutCard
            topicLabel={video.topic_label}
            description={video.description}
            questionCount={questions.length}
          />
          <div className="flex justify-end">
            <Button
              onClick={() => setPhase("quiz")}
              disabled={questions.length === 0}
            >
              Continue to questions
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {phase === "quiz" && activeQuestion && (
        <div className="mt-6 space-y-4">
          <QuizQuestion
            question={activeQuestion}
            index={currentQ}
            total={questions.length}
            selected={answers[activeQuestion.id]}
            revealed={Boolean(revealed[activeQuestion.id])}
            onSelect={(opt) => handleSelect(activeQuestion.id, opt)}
          />

          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              disabled={currentQ === 0}
              onClick={() => setCurrentQ((i) => i - 1)}
            >
              Previous
            </Button>
            {currentQ < questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQ((i) => i + 1)}
                disabled={!revealed[activeQuestion.id]}
              >
                Next question
              </Button>
            ) : (
              <Button
                onClick={handleFinishQuiz}
                disabled={!allAnswered || saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  "Finish & see results"
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === "done" && (
        <Card className="mt-6 p-8 text-center">
          {isPerfect ? (
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#10B981]" />
          ) : isFailed ? (
            <XCircle className="mx-auto h-12 w-12 text-[#C0271E]" />
          ) : (
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#F4A11A]" />
          )}
          <h2 className="mt-4 font-[family-name:var(--font-barlow-semi)] text-xl font-bold">
            {isPerfect
              ? "Perfect — you got it!"
              : `You scored ${resultScore}/${totalQuestions}`}
          </h2>
          <p className="mt-2 text-sm text-[#64748B]">
            {isPerfect
              ? "Great work. Move on to the next block video or revisit your weak areas in Practice."
              : isFailed
                ? "Review the explanations below and rewatch the video if needed before moving on."
                : "Review the explanations below, then try related practice questions for this block."}
          </p>
          <div className="mt-6 space-y-3 text-left">
            {questions.map((q) => (
              <QuizQuestion
                key={q.id}
                question={q}
                index={questions.indexOf(q)}
                total={questions.length}
                selected={answers[q.id]}
                revealed
                onSelect={() => {}}
              />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button variant="secondary" onClick={handleWatchAgain}>
              Watch again
            </Button>
            <Link
              href="/dashboard/video-learning"
              className={cn(buttonVariants(), "inline-flex")}
            >
              Back to all videos
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

function QuizQuestion({
  question,
  index,
  total,
  selected,
  revealed,
  onSelect,
}: {
  question: BlockVideoQuestion;
  index: number;
  total: number;
  selected?: string;
  revealed: boolean;
  onSelect: (option: string) => void;
}) {
  const isCorrect = selected === question.correct_option;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[#E5E0D8] bg-[#1F2A37] px-5 py-3">
        <span className="font-[family-name:var(--font-ibm-mono)] text-[11px] font-semibold text-[#94A3B8]">
          CHECK-IN {index + 1} OF {total}
        </span>
      </div>
      <div className="p-5">
        <p className="text-sm font-semibold text-[#1F2A37]">{question.stem}</p>
        <div className="mt-4 space-y-2">
          {question.options.map((opt) => {
            const isSelected = selected === opt.key;
            const isAnswer = opt.key === question.correct_option;
            let style =
              "border-[#E5E0D8] hover:border-[#C0271E]/50 hover:bg-[#FFF8F7]";

            if (revealed) {
              if (isAnswer) {
                style = "border-[#10B981] bg-[#ECFDF5]";
              } else if (isSelected && !isAnswer) {
                style = "border-[#C0271E] bg-[#FEF2F2]";
              } else {
                style = "border-[#E5E0D8] opacity-60";
              }
            }

            return (
              <button
                key={opt.key}
                type="button"
                disabled={revealed}
                onClick={() => onSelect(opt.key)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
                  style,
                )}
              >
                <span className="font-[family-name:var(--font-ibm-mono)] text-xs font-bold text-[#C0271E]">
                  {opt.key}
                </span>
                <span className="text-[#475569]">{opt.text}</span>
              </button>
            );
          })}
        </div>
        {revealed && (
          <div
            className={cn(
              "mt-4 rounded-lg border p-3 text-sm",
              isCorrect
                ? "border-[#10B981]/30 bg-[#ECFDF5] text-[#065F46]"
                : "border-[#C0271E]/30 bg-[#FEF2F2] text-[#991B1B]",
            )}
          >
            {question.explanation}
          </div>
        )}
      </div>
    </Card>
  );
}
