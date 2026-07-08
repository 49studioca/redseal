"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonRichText } from "@/components/learn/lesson-rich-text";

interface LessonCheckQuestionProps {
  label?: string;
  answer: string;
  steps?: string;
}

export function LessonCheckQuestion({
  label,
  answer,
  steps,
}: LessonCheckQuestionProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-xl border border-[#E5E0D8] bg-white">
      <div className="flex items-center justify-between gap-4 p-4">
        <p className="text-sm font-semibold text-[#1F2A37]">
          <LessonRichText text={label ?? "Check your work"} />
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setRevealed((v) => !v)}
          className="shrink-0"
        >
          <Eye className="h-4 w-4" />
          {revealed ? "Hide answer" : "Reveal answer"}
          {revealed ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {revealed && (
        <div className="space-y-3 border-t border-[#E5E0D8] px-4 pb-4 pt-3">
          {steps && (
            <div className="space-y-1">
              {steps.split("\n").map((line, i) =>
                line.trim() === "" ? (
                  <div key={i} className="h-2" />
                ) : (
                  <div
                    key={i}
                    className="text-sm leading-relaxed text-[#475569]"
                  >
                    <LessonRichText text={line} />
                  </div>
                ),
              )}
            </div>
          )}
          <div className="rounded-lg border border-[#10B981]/30 bg-[#ECFDF5] p-3">
            <LessonRichText
              text={answer}
              className="text-sm font-semibold text-[#065F46]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
