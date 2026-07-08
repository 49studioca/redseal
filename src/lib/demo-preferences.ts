export const DEMO_TRADE_COOKIE = "demo_trade_id";
export const DEMO_PROVINCE_COOKIE = "demo_province";
export const DEMO_ONBOARDING_COOKIE = "demo_onboarding_completed";
export const DEMO_LANGUAGE_COOKIE = "demo_preferred_language";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function setDemoPreferences(tradeId: string, province: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${DEMO_TRADE_COOKIE}=${encodeURIComponent(tradeId)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  document.cookie = `${DEMO_PROVINCE_COOKIE}=${encodeURIComponent(province)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  document.cookie = `${DEMO_ONBOARDING_COOKIE}=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function setDemoLanguage(language: string) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${DEMO_LANGUAGE_COOKIE}=${encodeURIComponent(language)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function readDemoPreferences(cookies: {
  get: (name: string) => { value: string } | undefined;
}) {
  const tradeId = cookies.get(DEMO_TRADE_COOKIE)?.value;
  const province = cookies.get(DEMO_PROVINCE_COOKIE)?.value;
  const onboardingCompleted = cookies.get(DEMO_ONBOARDING_COOKIE)?.value === "1";
  const preferredLanguage = cookies.get(DEMO_LANGUAGE_COOKIE)?.value;
  return {
    tradeId: tradeId ? decodeURIComponent(tradeId) : null,
    province: province ? decodeURIComponent(province) : null,
    onboardingCompleted,
    preferredLanguage: preferredLanguage
      ? decodeURIComponent(preferredLanguage)
      : "en",
  };
}
