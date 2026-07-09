import type { ContentBlock } from "@/types";
import { normalizeContentBlocks } from "@/lib/content/normalize-content-blocks";
import { injectBlockMedia } from "@/lib/content/inject-block-media";
import { coalesceCheckQuestionMeta } from "@/lib/content/check-question-meta";
import type { BlockMediaOverrideRow } from "@/lib/admin/lesson-media";

const CONTENT_BLOCK_TYPES = new Set<ContentBlock["type"]>([
  "text",
  "heading",
  "image",
  "math",
  "video",
  "callout",
  "check_question",
]);

function normalizeBlockType(type: unknown): ContentBlock["type"] | null {
  if (typeof type !== "string") return null;
  const normalized = type.trim().toLowerCase() as ContentBlock["type"];
  return CONTENT_BLOCK_TYPES.has(normalized) ? normalized : null;
}

export function parseContentBlocks(raw: unknown): ContentBlock[] {
  let blocks: unknown[] = [];

  if (Array.isArray(raw)) {
    blocks = raw;
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) blocks = parsed;
    } catch {
      return [];
    }
  } else {
    return [];
  }

  const parsed: ContentBlock[] = [];

  for (const entry of blocks) {
    if (!entry || typeof entry !== "object") continue;
    const block = entry as Record<string, unknown>;
    const type = normalizeBlockType(block.type);
    if (!type || typeof block.content !== "string") continue;

    parsed.push({
      type,
      content: block.content,
      meta:
        type === "check_question"
          ? coalesceCheckQuestionMeta(block)
          : block.meta && typeof block.meta === "object"
            ? (block.meta as Record<string, unknown>)
            : undefined,
    });
  }

  return parsed;
}

export function taskCodeFromLessonSlug(slug: string): string | undefined {
  const match = slug.match(/^block-[a-z]-([a-z]-\d+)-/i);
  return match ? match[1].toUpperCase() : undefined;
}

export function blockCodeFromLessonSlug(slug: string): string | undefined {
  const match = slug.match(/^block-([a-z])(?:-|$)/i);
  return match ? match[1].toUpperCase() : undefined;
}

export function prepareLessonBlocks(
  raw: unknown,
  tradeCode: string,
  blockCode?: string,
  taskCode?: string,
  mediaOverrides?: BlockMediaOverrideRow[],
): ContentBlock[] {
  const normalized = normalizeContentBlocks(parseContentBlocks(raw));
  const code = blockCode?.trim().toUpperCase();
  if (!code) return normalized;
  return injectBlockMedia(normalized, tradeCode, code, taskCode, mediaOverrides);
}
