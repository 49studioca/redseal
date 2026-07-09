"use client";

import katex from "katex";
import "katex/dist/katex.min.css";
import { TextWithRuleReferences } from "@/components/learn/text-with-rule-references";
import {
  parseLessonMathText,
  textHasDisplayMath,
  textNeedsMathRendering,
} from "@/lib/math/inline-math";
import { normalizeMathLatex } from "@/lib/math/normalize-latex";

function renderMathHtml(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(normalizeMathLatex(latex), {
      displayMode,
      throwOnError: false,
      strict: "ignore",
      output: "html",
    });
  } catch {
    return latex;
  }
}

function InlineMath({ latex }: { latex: string }) {
  const html = renderMathHtml(latex, false);
  if (html === latex) {
    return (
      <span className="font-[family-name:var(--font-ibm-mono)] text-sm">
        {latex}
      </span>
    );
  }

  return (
    <span
      className="mx-0.5 inline-block align-baseline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function DisplayMath({ latex }: { latex: string }) {
  const html = renderMathHtml(latex, true);
  if (html === latex) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-[#F6F3EE] p-4 text-sm text-[#475569]">
        {latex}
      </pre>
    );
  }

  return (
    <div className="my-3 overflow-x-auto rounded-lg bg-[#F6F3EE] px-4 py-3">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export function LessonRichText({
  text,
  lessonId,
  className,
  codeVersion,
}: {
  text: string;
  lessonId?: string;
  className?: string;
  codeVersion?: string;
}) {
  if (!textNeedsMathRendering(text)) {
    return (
      <TextWithRuleReferences
        text={text}
        lessonId={lessonId}
        className={className}
        codeVersion={codeVersion}
      />
    );
  }

  const parts = parseLessonMathText(text);
  const useBlockLayout =
    textHasDisplayMath(text) ||
    parts.some((part) => part.type === "math" && part.display);

  const content = parts.map((part, index) => {
    if (part.type === "break") {
      return <div key={index} className="mt-2" />;
    }

    if (part.type === "math") {
      return part.display ? (
        <DisplayMath key={index} latex={part.content} />
      ) : (
        <InlineMath key={index} latex={part.content} />
      );
    }

    if (!part.content) return null;

    return (
      <TextWithRuleReferences
        key={index}
        text={part.content}
        lessonId={lessonId}
        codeVersion={codeVersion}
      />
    );
  });

  if (useBlockLayout) {
    return <div className={className}>{content}</div>;
  }

  return <span className={className}>{content}</span>;
}
