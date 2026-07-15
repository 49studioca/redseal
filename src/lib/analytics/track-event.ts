"use client";

import { sendGAEvent } from "@next/third-parties/google";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** GA4 recommended + RedSeal custom conversion/engagement events. */
export type AnalyticsEventName =
  | "sign_up"
  | "login"
  | "logout"
  | "begin_checkout"
  | "purchase"
  | "subscribe"
  | "cancel_subscription"
  | "retain_subscription"
  | "reactivate_subscription"
  | "tutorial_complete"
  | "select_content"
  | "start_lesson"
  | "start_practice"
  | "practice_answer"
  | "save_question"
  | "start_mock_exam"
  | "complete_mock_exam"
  | "start_flashcards"
  | "flashcard_review";

export type AnalyticsParams = Record<
  string,
  string | number | boolean | null | undefined | AnalyticsParams[]
>;

const PENDING_AUTH_KEY = "ga_pending_auth";

/**
 * Fire a GA4 event. Safe no-op on the server or when gtag is unavailable.
 */
export function trackEvent(
  name: AnalyticsEventName,
  params: AnalyticsParams = {},
): void {
  if (typeof window === "undefined") return;

  const cleaned: Record<string, string | number | boolean | object> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    cleaned[key] = value as string | number | boolean | object;
  }

  try {
    sendGAEvent("event", name, cleaned);
  } catch {
    window.gtag?.("event", name, cleaned);
  }
}

export type AuthMethod = "email" | "google" | "apple";

/** Remember OAuth intent so we can fire sign_up/login after redirect. */
export function markPendingAuthEvent(
  event: "sign_up" | "login",
  method: AuthMethod,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      PENDING_AUTH_KEY,
      JSON.stringify({ event, method, at: Date.now() }),
    );
  } catch {
    // ignore
  }
}

/** Consume and fire a pending OAuth auth event if present (5 min TTL). */
export function flushPendingAuthEvent(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(PENDING_AUTH_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PENDING_AUTH_KEY);
    const parsed = JSON.parse(raw) as {
      event?: "sign_up" | "login";
      method?: AuthMethod;
      at?: number;
    };
    if (!parsed.event || !parsed.method) return;
    if (parsed.at && Date.now() - parsed.at > 5 * 60 * 1000) return;
    trackEvent(parsed.event, { method: parsed.method });
  } catch {
    // ignore
  }
}
