import type { ContentBlock } from "@/types";
import { getBlockMedia } from "@/data/block-media";

function hasMediaType(blocks: ContentBlock[], type: "video" | "image") {
  return blocks.some((b) => b.type === type);
}

function isWikimediaUrl(url: string) {
  return url.includes("upload.wikimedia.org");
}

/** Swap AI-hallucinated Commons URLs for verified curated images. */
function replaceWikimediaImages(
  blocks: ContentBlock[],
  images: NonNullable<ReturnType<typeof getBlockMedia>>["images"],
): ContentBlock[] {
  if (!images?.length) return blocks;

  let imageIndex = 0;
  let replaced = false;

  const updated = blocks.map((block) => {
    if (block.type !== "image" || !isWikimediaUrl(block.content)) return block;

    const curated = images[imageIndex] ?? images[images.length - 1];
    imageIndex += 1;
    replaced = true;

    return {
      ...block,
      content: curated.src,
      meta: { alt: curated.alt, caption: curated.caption },
    };
  });

  return replaced ? updated : blocks;
}

/** Insert curated YouTube + images when the lesson has no media yet. */
export function injectBlockMedia(
  blocks: ContentBlock[],
  tradeCode: string,
  blockCode?: string,
): ContentBlock[] {
  if (!blockCode) return blocks;

  const media = getBlockMedia(tradeCode, blockCode);
  if (!media) return blocks;

  let result = blocks;

  if (media.images && hasMediaType(result, "image")) {
    result = replaceWikimediaImages(result, media.images);
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
