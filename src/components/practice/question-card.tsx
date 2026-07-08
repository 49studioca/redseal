"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Flag,
  Bookmark,
  BookOpen,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  onAnswer?: (option: string, isCorrect: boolean) => void;
  /** Restore a previous selection when navigating back (mock exam / diagnostic). */
  initialSelected?: string | null;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  showReference,
  onOpenReference,
  onDiscuss,
  onReport,
  onAnswer,
  initialSelected = null,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(initialSelected);

  useEffect(() => {
    setSelected(initialSelected ?? null);
  }, [question.id, initialSelected]);
  const answered = selected !== null;
  const isCorrect = selected === question.correct_option;

  const handleSelect = (key: string) => {
    if (answered) return;
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
          {question.stem}
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
                disabled={answered}
                className={cn(
                  "flex items-center gap-3 rounded-[11px] border p-3 text-left transition-all",
                  style,
                  !answered && "cursor-pointer",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-[family-name:var(--font-ibm-mono)] text-xs font-bold",
                    answered && isCorrectOption
                      ? "bg-[#10B981] text-white"
                      : answered && isSelected
                        ? "bg-[#EF4444] text-white"
                        : "bg-[#F1ECE3] text-[#64748B]",
                  )}
                >
                  {option.key}
                </span>
                <span className="flex-1 text-sm">{option.text}</span>
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
                {isCorrect ? "Correct!" : "Not quite"}
              </div>
              {wrongRationale && (
                <p className="mt-1 text-sm text-[#475569]">
                  It looks like you may have: <em>{wrongRationale}</em>
                </p>
              )}
              <p className="mt-2 text-sm leading-relaxed text-[#475569]">
                {question.explanation}
              </p>
              {question.code_citations.length > 0 && (
                <div className="mt-2 space-y-1">
                  {question.code_citations.map((c, i) => (
                    <div
                      key={i}
                      className="font-[family-name:var(--font-ibm-mono)] text-xs text-[#C0271E]"
                    >
                      {c.rule_number} — {c.section_title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2 border-t border-[#E5E0D8] pt-4">
          <Button variant="ghost" size="sm" onClick={onDiscuss}>
            <MessageSquare className="h-4 w-4" /> Discuss
          </Button>
          <Button variant="ghost" size="sm" onClick={onReport}>
            <Flag className="h-4 w-4" /> Report Error
          </Button>
          <Button variant="ghost" size="sm" className="ml-auto">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
