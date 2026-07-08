"use client";

import katex from "katex";
import "katex/dist/katex.min.css";
import { parseMathBlockContent } from "@/lib/math/normalize-latex";

export function MathBlock({ content }: { content: string }) {
  const { latex, example } = parseMathBlockContent(content);

  let html = "";
  try {
    html = katex.renderToString(latex, {
      displayMode: true,
      throwOnError: true,
      strict: "ignore",
    });
  } catch {
    html = `<span class="text-sm text-[#B91C1C]">Unable to render formula</span>`;
  }

  return (
    <div className="space-y-3 overflow-x-auto rounded-lg bg-[#F6F3EE] p-4">
      <div dangerouslySetInnerHTML={{ __html: html }} />
      {example && (
        <p className="text-sm leading-relaxed text-[#64748B]">{example}</p>
      )}
    </div>
  );
}
