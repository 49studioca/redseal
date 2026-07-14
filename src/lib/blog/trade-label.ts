/** Pure, client-safe helpers for blog trade scope (no server imports). */

export function blogTradeLabel(post: {
  trade_name?: string | null;
  trade_slug?: string | null;
}): string {
  return post.trade_name?.trim() || "Red Seal (general)";
}

export function isGeneralBlogPost(post: {
  trade_slug?: string | null;
  trade_id?: string | null;
}): boolean {
  return !post.trade_slug && !post.trade_id;
}
