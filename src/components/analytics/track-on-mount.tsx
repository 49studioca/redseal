"use client";

import { useEffect } from "react";
import {
  trackEvent,
  type AnalyticsEventName,
  type AnalyticsParams,
} from "@/lib/analytics/track-event";

type TrackOnMountProps = {
  event: AnalyticsEventName;
  params?: AnalyticsParams;
  /** When set, only fire once per key in this browser tab. */
  onceKey?: string;
};

/**
 * Fire a GA event when a server-rendered page mounts in the browser.
 */
export function TrackOnMount({ event, params, onceKey }: TrackOnMountProps) {
  useEffect(() => {
    if (onceKey) {
      try {
        const storageKey = `ga_once_${onceKey}`;
        if (sessionStorage.getItem(storageKey)) return;
        sessionStorage.setItem(storageKey, "1");
      } catch {
        // continue
      }
    }
    trackEvent(event, params);
    // Intentionally once on mount for the given event/params snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
