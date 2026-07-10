import {
  BLOCK_MEDIA,
  blockMediaKey,
  getBlockMedia,
  type BlockMediaBundle,
  type BlockMediaImage,
  type BlockMediaVideo,
} from "@/data/block-media";
import {
  LESSON_IMAGE_ASSETS,
  type LessonImageKey,
} from "@/data/lesson-image-assets";
import { lessonImageSrc } from "@/lib/storage/lesson-images";
import {
  blockCodeFromLessonSlug,
  taskCodeFromLessonSlug,
} from "@/lib/content/parse-content-blocks";

export type BlockMediaOverrideRow = {
  media_key: string;
  media_type: "image" | "video";
  video_youtube_id: string | null;
  video_title: string | null;
  image_src: string | null;
  image_alt: string | null;
  image_caption: string | null;
};

export type LessonMediaReportRow = {
  id: string;
  lesson_id: string;
  block_index: number;
  media_type: "image" | "video";
  media_src: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  lesson?: {
    id: string;
    title: string;
    slug: string;
    chapter_task_code: string | null;
    trade?: { code: string; name: string } | null;
    block?: { code: string; name: string } | null;
  } | null;
};

export function resolveLessonMediaContext(lesson: {
  slug: string;
  chapter_task_code?: string | null;
  trade?: { code: string } | null;
  block?: { code: string } | null;
}) {
  const tradeCode = lesson.trade?.code ?? "";
  const blockCode =
    lesson.block?.code ?? blockCodeFromLessonSlug(lesson.slug) ?? "";
  const taskCode =
    lesson.chapter_task_code ?? taskCodeFromLessonSlug(lesson.slug);
  const mediaKey = blockMediaKey(tradeCode, blockCode, taskCode);

  return { tradeCode, blockCode, taskCode, mediaKey };
}

export function mergeMediaOverride(
  bundle: BlockMediaBundle,
  overrides: BlockMediaOverrideRow[],
): BlockMediaBundle {
  const merged = { ...bundle, images: bundle.images ? [...bundle.images] : undefined };

  for (const row of overrides) {
    if (row.media_type === "video" && row.video_youtube_id && row.video_title) {
      merged.video = {
        youtubeId: row.video_youtube_id,
        title: row.video_title,
      };
    }
    if (row.media_type === "image" && row.image_src && row.image_alt) {
      merged.images = [
        {
          src: row.image_src,
          alt: row.image_alt,
          caption: row.image_caption ?? undefined,
        },
      ];
    }
  }

  return merged;
}

export function getBlockMediaWithOverrides(
  tradeCode: string,
  blockCode: string,
  taskCode: string | undefined,
  overrides: BlockMediaOverrideRow[],
): BlockMediaBundle | undefined {
  const base = getBlockMedia(tradeCode, blockCode, taskCode);
  if (!base) return undefined;
  const mediaKey = blockMediaKey(tradeCode, blockCode, taskCode);
  const relevant = overrides.filter((row) => row.media_key === mediaKey);
  if (!relevant.length) return base;
  return mergeMediaOverride(base, relevant);
}

export function imageFromAssetKey(
  key: LessonImageKey,
  caption?: string,
): BlockMediaImage {
  const label = key.replace(/-/g, " ");
  return {
    src: lessonImageSrc(key),
    alt: `Industrial ${label}`,
    caption: caption ?? `Reference image: ${label}.`,
  };
}

export function listImageAssetKeys(): LessonImageKey[] {
  return Object.keys(LESSON_IMAGE_ASSETS) as LessonImageKey[];
}

export function listVideoAlternatives(
  tradeCode: string,
  excludeId: string,
): BlockMediaVideo[] {
  const seen = new Set<string>();
  const options: BlockMediaVideo[] = [];

  for (const [key, bundle] of Object.entries(BLOCK_MEDIA)) {
    if (!key.startsWith(`${tradeCode.trim().toUpperCase()}-`)) continue;
    const video = bundle.video;
    if (!video || video.youtubeId === excludeId || seen.has(video.youtubeId)) {
      continue;
    }
    seen.add(video.youtubeId);
    options.push(video);
  }

  return options;
}

/** Pick the first curated image asset not already used in this trade's catalog. */
export function pickAlternativeImage(
  tradeCode: string,
  currentSrc: string,
  preserveCaption?: string,
): BlockMediaImage | null {
  const used = new Set<string>();
  for (const [key, bundle] of Object.entries(BLOCK_MEDIA)) {
    if (!key.startsWith(`${tradeCode.trim().toUpperCase()}-`)) continue;
    for (const image of bundle.images ?? []) {
      used.add(image.src);
    }
  }

  for (const key of listImageAssetKeys()) {
    const src = lessonImageSrc(key);
    if (src !== currentSrc && !used.has(src)) {
      return imageFromAssetKey(key, preserveCaption);
    }
  }

  return null;
}

export function pickAlternativeVideo(
  tradeCode: string,
  currentId: string,
): BlockMediaVideo | null {
  const options = listVideoAlternatives(tradeCode, currentId);
  return options[0] ?? null;
}

export type SwapLessonMediaInput = {
  tradeCode: string;
  blockCode: string;
  taskCode?: string;
  mediaKey: string;
  mediaType: "image" | "video";
  currentSrc: string;
  mode: "auto" | "manual";
  /** Manual image: curated catalog key OR direct image URL */
  imageKey?: string;
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
  youtubeId?: string;
  videoTitle?: string;
};

export type SwapLessonMediaResult = {
  mediaKey: string;
  mediaType: "image" | "video";
  image?: BlockMediaImage;
  video?: BlockMediaVideo;
};

export function buildMediaSwap(
  input: SwapLessonMediaInput,
): SwapLessonMediaResult | { error: string } {
  const curated = getBlockMedia(
    input.tradeCode,
    input.blockCode,
    input.taskCode,
  );
  const existingCaption = curated?.images?.[0]?.caption;

  if (input.mediaType === "image") {
    let image: BlockMediaImage | null = null;

    if (input.mode === "manual" && input.imageSrc) {
      image = {
        src: input.imageSrc,
        alt: input.imageAlt?.trim() || "Lesson reference image",
        caption:
          input.imageCaption?.trim() ||
          existingCaption ||
          input.imageAlt?.trim() ||
          "Lesson reference image",
      };
    } else if (input.mode === "manual" && input.imageKey) {
      image = imageFromAssetKey(
        input.imageKey as LessonImageKey,
        existingCaption,
      );
    } else {
      // Auto mode without a pre-resolved AI image falls back to catalog.
      image = pickAlternativeImage(
        input.tradeCode,
        input.currentSrc,
        existingCaption,
      );
    }

    if (!image) {
      return { error: "No alternative image available" };
    }

    return {
      mediaKey: input.mediaKey,
      mediaType: "image",
      image,
    };
  }

  const video =
    input.mode === "manual" && input.youtubeId && input.videoTitle
      ? { youtubeId: input.youtubeId, title: input.videoTitle }
      : pickAlternativeVideo(input.tradeCode, input.currentSrc);

  if (!video) {
    return {
      error:
        "No alternative video available — provide youtube_id and video_title",
    };
  }

  return {
    mediaKey: input.mediaKey,
    mediaType: "video",
    video,
  };
}
