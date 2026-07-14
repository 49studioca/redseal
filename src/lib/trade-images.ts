/**
 * Trade hero photos live in /public/trades/<slug>.jpg. Only trades with an
 * image file are listed here; everything else falls back to the emoji design.
 * Add a new file to /public/trades and register its slug below to enable it.
 */
const TRADE_IMAGE_SLUGS = new Set<string>([
  "construction-electrician",
  "plumber",
  "welder",
  "industrial-electrician",
  "carpenter",
]);

export function getTradeImageSrc(slug: string): string | null {
  return TRADE_IMAGE_SLUGS.has(slug) ? `/trades/${slug}.jpg` : null;
}
