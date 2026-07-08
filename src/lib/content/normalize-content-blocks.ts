import type { ContentBlock } from "@/types";
import { normalizeInlineMathText } from "@/lib/math/inline-math";
import {
  looksLikeMathJson,
  parseMathBlockContent,
} from "@/lib/math/normalize-latex";

function normalizeCheckQuestionBlock(block: ContentBlock): ContentBlock {
  if (block.type !== "check_question" || !block.meta) return block;

  const meta = { ...block.meta };
  if (typeof meta.answer === "string") {
    meta.answer = normalizeInlineMathText(meta.answer);
  }
  if (typeof meta.steps === "string") {
    meta.steps = normalizeInlineMathText(meta.steps);
  }

  return { ...block, meta };
}

function normalizeTextBlock(block: ContentBlock): ContentBlock {
  if (
    block.type !== "text" &&
    block.type !== "callout" &&
    block.type !== "heading"
  ) {
    return block;
  }

  const content = normalizeInlineMathText(block.content);
  const displayOnly = content.match(/^\\\[([\s\S]+)\\\]$|^\$\$([\s\S]+)\$\$$/);

  if (displayOnly) {
    const latex = displayOnly[1] ?? displayOnly[2] ?? "";
    return { type: "math", content: latex };
  }

  return { ...block, content };
}

/** Normalize AI lesson blocks so JSON formulas render as KaTeX math. */
export function normalizeContentBlocks(blocks: ContentBlock[]): ContentBlock[] {
  const normalized: ContentBlock[] = [];

  for (const block of blocks) {
    const isMathPayload =
      block.type === "math" || looksLikeMathJson(block.content);

    if (isMathPayload) {
      const { latex, example } = parseMathBlockContent(block.content);
      normalized.push({ type: "math", content: latex });
      if (example) {
        normalized.push(
          normalizeTextBlock({ type: "text", content: example }),
        );
      }
      continue;
    }

    normalized.push(normalizeTextBlock(block));
  }

  return normalized.map(normalizeCheckQuestionBlock);
}
