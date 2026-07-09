import type { ContentBlock } from "@/types";
import {
  blockMediaKey,
  getBlockMedia,
  type BlockMediaBundle,
} from "@/data/block-media";
import type { BlockMediaOverrideRow } from "@/lib/admin/lesson-media";
import { mergeMediaOverride } from "@/lib/admin/lesson-media";

function hasMediaType(blocks: ContentBlock[], type: "video" | "image") {
  return blocks.some((b) => b.type === type);
}

/** Swap lesson image blocks for verified curated images when available. */
function replaceImagesWithCurated(
  blocks: ContentBlock[],
  images: NonNullable<ReturnType<typeof getBlockMedia>>["images"],
): ContentBlock[] {
  if (!images?.length) return blocks;

  let imageIndex = 0;
  let replaced = false;

  const updated = blocks.map((block) => {
    if (block.type !== "image") return block;

    const curated = images[imageIndex] ?? images[images.length - 1];
    imageIndex += 1;
    replaced = true;

    return {
      type: "image" as const,
      content: curated.src,
      meta: { alt: curated.alt, caption: curated.caption },
    };
  });

  return replaced ? updated : blocks;
}

/** Swap AI-hallucinated or broken YouTube IDs for verified curated videos. */
function replaceVideoWithCurated(
  blocks: ContentBlock[],
  video: NonNullable<ReturnType<typeof getBlockMedia>>["video"],
): ContentBlock[] {
  if (!video) return blocks;

  let replaced = false;
  const updated = blocks.map((block) => {
    if (block.type !== "video") return block;

    replaced = true;
    return {
      type: "video" as const,
      content: video.youtubeId,
      meta: { title: video.title },
    };
  });

  return replaced ? updated : blocks;
}

/** Insert curated YouTube + images when the lesson has no media yet. */
export function injectBlockMedia(
  blocks: ContentBlock[],
  tradeCode: string,
  blockCode?: string,
  taskCode?: string,
  mediaOverrides?: BlockMediaOverrideRow[],
): ContentBlock[] {
  if (!blockCode) return blocks;

  let media: BlockMediaBundle | undefined = getBlockMedia(
    tradeCode,
    blockCode,
    taskCode,
  );
  if (!media) return blocks;

  if (mediaOverrides?.length) {
    const key = blockMediaKey(tradeCode, blockCode, taskCode);
    const relevant = mediaOverrides.filter((row) => row.media_key === key);
    if (relevant.length) {
      media = mergeMediaOverride(media, relevant);
    }
  }

  let result = blocks;

  if (media.video) {
    if (hasMediaType(result, "video")) {
      result = replaceVideoWithCurated(result, media.video);
    }
  }

  if (media.images && hasMediaType(result, "image")) {
    result = replaceImagesWithCurated(result, media.images);
  }

  const inserts: ContentBlock[] = [];

  if (media.video && !hasMediaType(result, "video")) {
    inserts.push({
      type: "video",
      content: media.video.youtubeId,
      meta: { title: media.video.title },
    });
  }

  if (media.images && !hasMediaType(result, "image")) {
    for (const image of media.images) {
      inserts.push({
        type: "image",
        content: image.src,
        meta: { alt: image.alt, caption: image.caption },
      });
    }
  }

  if (inserts.length === 0) return result;

  let insertAt = Math.min(3, result.length);
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].type === "heading" && result[i + 1].type === "text") {
      insertAt = i + 2;
      break;
    }
  }

  return [
    ...result.slice(0, insertAt),
    ...inserts,
    ...result.slice(insertAt),
  ];
}
