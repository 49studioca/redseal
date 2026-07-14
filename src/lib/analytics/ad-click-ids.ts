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

export { COOKIE_NAME as AD_CLICK_COOKIE_NAME, COOKIE_MAX_AGE as AD_CLICK_COOKIE_MAX_AGE };
