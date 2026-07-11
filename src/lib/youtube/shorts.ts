/** Detect YouTube Shorts from SERP URL or metadata. */
export function isYoutubeShortVideo(
  url: string,
  title?: string,
  description?: string,
): boolean {
  if (/\/shorts(?:\/|\?|#|$)/i.test(url)) return true;
  if (/youtube\.com\/.*[?&]shorts=/i.test(url)) return true;

  const hay = `${title ?? ""} ${description ?? ""}`.toLowerCase();
  if (/\b(#shorts|youtube shorts)\b/i.test(hay)) return true;

  return false;
}

/** Minimum typical length for training videos (exclude Shorts-style clips). */
export const MIN_TRAINING_VIDEO_SECONDS = 120;
