/** Click / attribution params Google Ads and GA rely on. */
export const AD_CLICK_PARAM_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "dclid",
  "gad_source",
  "gad_campaignid",
] as const;

export type AdClickParamKey = (typeof AD_CLICK_PARAM_KEYS)[number];

const COOKIE_NAME = "_rs_gclid";
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60; // 90 days

export function pickAdClickParams(
  source: URLSearchParams | { get(name: string): string | null },
): URLSearchParams {
  const picked = new URLSearchParams();
  for (const key of AD_CLICK_PARAM_KEYS) {
    const value = source.get(key)?.trim();
    if (value) picked.set(key, value);
  }
  return picked;
}

export function appendAdClickParams(
  target: URLSearchParams,
  source: URLSearchParams | { get(name: string): string | null },
): URLSearchParams {
  const picked = pickAdClickParams(source);
  picked.forEach((value, key) => {
    if (!target.has(key)) target.set(key, value);
  });
  return target;
}

export function getPrimaryAdClickId(
  source: URLSearchParams | { get(name: string): string | null },
): string | null {
  return (
    source.get("gclid")?.trim() ||
    source.get("gbraid")?.trim() ||
    source.get("wbraid")?.trim() ||
    null
  );
}

/** Serialize picked click IDs for the first-party cookie (`gclid=…&gbraid=…`). */
export function serializeAdClickCookie(params: URLSearchParams): string | null {
  const picked = pickAdClickParams(params);
  const value = picked.toString();
  return value || null;
}

/**
 * Parse cookie value. Supports legacy bare IDs (gclid-only) and
 * `application/x-www-form-urlencoded` param strings.
 */
export function parseAdClickCookie(
  value: string | undefined | null,
): URLSearchParams {
  const raw = value?.trim();
  if (!raw) return new URLSearchParams();

  if (!raw.includes("=")) {
    const legacy = new URLSearchParams();
    legacy.set("gclid", raw);
    return legacy;
  }

  try {
    return pickAdClickParams(new URLSearchParams(raw));
  } catch {
    return new URLSearchParams();
  }
}

/** Merge URL + cookie click IDs (URL wins on conflicts). */
export function mergeAdClickParams(
  urlParams: URLSearchParams | { get(name: string): string | null },
  cookieValue: string | undefined | null,
): URLSearchParams {
  const merged = parseAdClickCookie(cookieValue);
  pickAdClickParams(urlParams).forEach((value, key) => {
    merged.set(key, value);
  });
  return merged;
}

/** Read stored click IDs from `document.cookie` (client only). */
export function readAdClickParamsFromDocument(): URLSearchParams {
  if (typeof document === "undefined") return new URLSearchParams();
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return new URLSearchParams();
  return parseAdClickCookie(decodeURIComponent(match.slice(COOKIE_NAME.length + 1)));
}

export {
  COOKIE_NAME as AD_CLICK_COOKIE_NAME,
  COOKIE_MAX_AGE as AD_CLICK_COOKIE_MAX_AGE,
};
