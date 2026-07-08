"use client";

import type { ContentBlock } from "@/types";
import { LessonCheckQuestion } from "@/components/learn/lesson-check-question";
import { MathBlock } from "@/components/learn/math-block";
import { LessonVideo } from "@/components/learn/lesson-video";
import { LessonImage } from "@/components/learn/lesson-image";
import { LessonRichText } from "@/components/learn/lesson-rich-text";

export function LessonContent({
  blocks,
  lessonId,
}: {
  blocks: ContentBlock[];
  lessonId?: string;
}) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                key={i}
                className="font-[family-name:var(--font-barlow-semi)] text-xl font-semibold"
              >
                <LessonRichText text={block.content} lessonId={lessonId} />
              </h2>
            );
          case "text":
            return (
              <LessonRichText
                key={i}
                text={block.content}
                lessonId={lessonId}
                className="leading-relaxed text-[#475569]"
              />
            );
          case "math":
            return <MathBlock key={i} content={block.content} />;
          case "video":
            return (
              <LessonVideo
                key={i}
                content={block.content}
                title={block.meta?.title ? String(block.meta.title) : undefined}
              />
            );
          case "image":
            return (
              <LessonImage
                key={i}
                src={block.content}
                alt={String(block.meta?.alt ?? "Lesson illustration")}
                caption={
                  block.meta?.caption ? String(block.meta.caption) : undefined
                }
              />
            );
          case "callout":
            return (
              <div
                key={i}
                className={`rounded-xl border p-4 ${
                  block.meta?.variant === "warning"
                    ? "border-[#F4A11A]/40 bg-[#FFFBEB]"
                    : "border-[#10B981]/30 bg-[#ECFDF5]"
                }`}
              >
                <p className="text-sm">
                  <LessonRichText text={block.content} lessonId={lessonId} />
                </p>
              </div>
            );
          case "check_question":
            return (
              <LessonCheckQuestion
                key={i}
                label={block.content || undefined}
                answer={String(block.meta?.answer ?? "")}
                steps={block.meta?.steps ? String(block.meta.steps) : undefined}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
