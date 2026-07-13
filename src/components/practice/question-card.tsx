"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Flag,
  Bookmark,
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TranslatableText } from "@/components/translation/translatable-text";
import { cn } from "@/lib/utils";
import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  showReference?: boolean;
  onOpenReference?: () => void;
  onDiscuss?: () => void;
  onReport?: () => void;
  onBookmarkToggle?: () => void;
  bookmarked?: boolean;
  bookmarking?: boolean;
  onAnswer?: (option: string, isCorrect: boolean) => void;
  /** Restore a previous selection when navigating back (mock exam / diagnostic). */
  initialSelected?: string | null;
  /** Hide correct/incorrect feedback until review (mock exam). */
  hideResults?: boolean;
  /** Lock options and show scored state (mock exam review). */
  readOnly?: boolean;
  /** Reveal correct answers and explanations (mock exam review). */
  revealAnswer?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  showReference,
  onOpenReference,
  onDiscuss,
  onReport,
  onBookmarkToggle,
  bookmarked = false,
  bookmarking = false,
  onAnswer,
  initialSelected = null,
  hideResults = false,
  readOnly = false,
  revealAnswer = false,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(initialSelected);

  useEffect(() => {
    setSelected(initialSelected ?? null);
  }, [question.id, initialSelected]);

  const inReview = revealAnswer && readOnly;
  const wasSkipped = inReview && selected === null;
  const answered = inReview || (!hideResults && selected !== null);
  const isCorrect = selected === question.correct_option;

  const handleSelect = (key: string) => {
    if (answered || readOnly) return;
    setSelected(key);
    onAnswer?.(key, key === question.correct_option);
  };

  const selectedOption = question.options.find((o) => o.key === selected);
  const wrongRationale = !isCorrect
    ? selectedOption?.distractor_rationale
    : null;

  return (
    <div className="rounded-2xl border border-[#E5E0D8] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[#E5E0D8] bg-[#1F2A37] px-5 py-3.5 text-white">
        <div className="font-[family-name:var(--font-ibm-mono)] text-[11px] font-semibold text-[#94A3B8]">
          QUESTION {questionNumber} OF {totalQuestions}
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#F4A11A]/20 text-[#F4A11A]">
            {question.question_type}
          </Badge>
          {showReference && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenReference}
              className="text-white hover:bg-white/10"
            >
              <BookOpen className="h-4 w-4" /> Code Book
            </Button>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-[family-name:var(--font-barlow-semi)] text-lg font-semibold leading-snug">
          <TranslatableText text={question.stem} />
        </h3>

        <div className="mt-4 flex flex-col gap-2">
          {question.options.map((option) => {
            const isSelected = selected === option.key;
            const isCorrectOption = option.key === question.correct_option;
            let style = "border-[#E5E0D8] bg-white hover:border-[#C0271E]/40";

            if (answered) {
              if (isCorrectOption) style = "border-[#10B981] bg-[#ECFDF5]";
              else if (isSelected) style = "border-[#EF4444] bg-[#FEF2F2]";
              else style = "border-[#E5E0D8] bg-[#F6F3EE] opacity-60";
            } else if (isSelected) {
              style = "border-[#C0271E] bg-[#FCEBEC]";
            }

            return (
              <button
                key={option.key}
                onClick={() => handleSelect(option.key)}
                disabled={answered || readOnly}
                className={cn(
                  "flex items-center gap-3 rounded-[11px] border p-3 text-left transition-all",
                  style,
                  !answered && !readOnly && "cursor-pointer",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-[family-name:var(--font-ibm-mono)] text-xs font-bold",
                    answered && isCorrectOption
                      ? "bg-[#10B981] text-white"
                      : answered && isSelected
                        ? "bg-[#EF4444] text-white"
                        : isSelected
                          ? "bg-[#C0271E] text-white"
                          : "bg-[#F1ECE3] text-[#64748B]",
                  )}
                >
                  {option.key}
                </span>
                <span className="flex-1 text-sm">
                  <TranslatableText text={option.text} />
                </span>
                {answered && isCorrectOption && (
                  <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                )}
                {answered && isSelected && !isCorrectOption && (
                  <XCircle className="h-5 w-5 text-[#EF4444]" />
                )}
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            className={cn(
              "mt-4 flex gap-3 rounded-[11px] border p-3",
              isCorrect
                ? "border-[#10B981]/30 bg-[#ECFDF5]"
                : "border-[#EF4444]/30 bg-[#FEF2F2]",
            )}
          >
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#10B981]" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-[#EF4444]" />
            )}
            <div>
              <div
                className={cn(
                  "text-sm font-bold",
                  isCorrect ? "text-[#047857]" : "text-[#B91C1C]",
                )}
              >
                {isCorrect
                  ? "Correct!"
                  : wasSkipped
                    ? "Not answered"
                    : "Not quite"}
              </div>
              {wasSkipped && (
                <p className="mt-1 text-sm text-[#475569]">
                  The correct answer is{" "}
                  <b className="font-[family-name:var(--font-ibm-mono)]">
                    {question.correct_option}
                  </b>
                  .
                </p>
              )}
              {wrongRationale && (
                <p className="mt-1 text-sm text-[#475569]">
                  It looks like you may have:{" "}
                  <em>
                    <TranslatableText text={wrongRationale} />
                  </em>
                </p>
              )}
              <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                <TranslatableText text={question.explanation} />
              </p>
              {question.code_citations.length > 0 && (
                <div className="mt-2 space-y-1">
                  {question.code_citations.map((c, i) => (
                    <div
                      key={i}
                      className="font-[family-name:var(--font-ibm-mono)] text-xs text-[#C0271E]"
                    >
                      {c.rule_number}
                      {c.section_title ? (
                        <>
                          {" — "}
                          <TranslatableText text={c.section_title} />
                        </>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-1 border-t border-[#E5E0D8] pt-4 sm:gap-2">
          {onDiscuss && (
            <Button variant="ghost" size="sm" type="button" onClick={onDiscuss}>
              <MessageSquare className="h-4 w-4" /> Discuss
            </Button>
          )}
          {onReport && (
            <Button variant="ghost" size="sm" type="button" onClick={onReport}>
              <Flag className="h-4 w-4" /> Report Error
            </Button>
          )}
          {onBookmarkToggle && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              className={cn("ml-auto", bookmarked && "text-[#C0271E]")}
              disabled={bookmarking}
              onClick={onBookmarkToggle}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark question"}
              title={bookmarked ? "Saved — click to remove" : "Save question"}
            >
              {bookmarking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : bookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
