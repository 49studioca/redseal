import type { ContentBlock } from "@/types";
import {
  looksLikeMathJson,
  parseMathBlockContent,
} from "@/lib/math/normalize-latex";

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
        normalized.push({ type: "text", content: example });
      }
      continue;
    }

    normalized.push(block);
  }

  return normalized;
}
