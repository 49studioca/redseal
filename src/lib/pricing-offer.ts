/** First-visit 30% off pricing offer — one 24h window per browser (cookie). */

export const PRICING_OFFER_COOKIE = "rs_pricing_offer";
export const PRICING_OFFER_PERCENT = 30;
export const PRICING_OFFER_WINDOW_MS = 24 * 60 * 60 * 1000;
/** Remember the window started so the offer does not reset after expiry. */
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 90;

export type PricingOfferState =
  | { active: true; startedAt: number; endsAt: number; remainingMs: number }
  | { active: false; startedAt: number | null; endsAt: number | null; remainingMs: 0 };

function parseStartedAt(raw: string | undefined | null): number | null {
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function getPricingOfferState(
  startedAtRaw: string | undefined | null,
  now = Date.now(),
): PricingOfferState {
  const startedAt = parseStartedAt(startedAtRaw);
  if (startedAt == null) {
    return { active: false, startedAt: null, endsAt: null, remainingMs: 0 };
  }
  const endsAt = startedAt + PRICING_OFFER_WINDOW_MS;
  const remainingMs = endsAt - now;
  if (remainingMs <= 0) {
    return { active: false, startedAt, endsAt, remainingMs: 0 };
  }
  return { active: true, startedAt, endsAt, remainingMs };
}

export function discountedPrice(listPrice: number): number {
  const factor = (100 - PRICING_OFFER_PERCENT) / 100;
  return Math.round(listPrice * factor * 100) / 100;
}

export function formatCadPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/** Read offer start from `document.cookie` (client only). */
export function readPricingOfferCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${PRICING_OFFER_COOKIE}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : undefined;
}

/**
 * Start the 24h window on first visit. Returns the offer state after ensuring
 * the cookie exists. Does not refresh an already-started (or expired) window.
 */
export function ensurePricingOfferStarted(now = Date.now()): PricingOfferState {
  const existing = readPricingOfferCookie();
  if (existing) {
    return getPricingOfferState(existing, now);
  }

  if (typeof document === "undefined") {
    return { active: false, startedAt: null, endsAt: null, remainingMs: 0 };
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${PRICING_OFFER_COOKIE}=${encodeURIComponent(String(now))}; path=/; max-age=${COOKIE_MAX_AGE_SEC}; SameSite=Lax${secure}`;
  return getPricingOfferState(String(now), now);
}

export function formatOfferCountdown(remainingMs: number): string {
  const totalSec = Math.max(0, Math.floor(remainingMs / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
