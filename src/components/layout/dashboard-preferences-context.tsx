"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_LANGUAGE_COOKIE,
  setDemoLanguage,
  setDemoProvince,
  setDemoTranslationEnabled,
} from "@/lib/demo-preferences";
import { getProvinceByCode } from "@/lib/provinces";

type DashboardPreferencesContextValue = {
  preferredLanguage: string;
  setPreferredLanguage: (code: string) => Promise<void>;
  isUpdatingLanguage: boolean;
  translationEnabled: boolean;
  setTranslationEnabled: (enabled: boolean) => void;
  province: string;
  provinceName: string;
  setProvince: (code: string) => Promise<void>;
  isUpdatingProvince: boolean;
};

const DashboardPreferencesContext =
  createContext<DashboardPreferencesContextValue | null>(null);

export function DashboardPreferencesProvider({
  preferredLanguage: initialLanguage,
  translationEnabled: initialTranslationEnabled,
  province: initialProvince,
  children,
}: {
  preferredLanguage: string;
  translationEnabled: boolean;
  province: string;
  children: ReactNode;
}) {
  const [preferredLanguage, setLanguageState] = useState(initialLanguage);
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);
  const [translationEnabled, setTranslationEnabledState] = useState(
    initialTranslationEnabled,
  );
  const [province, setProvinceState] = useState(initialProvince);
  const [isUpdatingProvince, setIsUpdatingProvince] = useState(false);

  const setPreferredLanguage = useCallback(async (code: string) => {
    setIsUpdatingLanguage(true);
    setLanguageState(code);
    setDemoLanguage(code);

    try {
      const res = await fetch("/api/profile/language", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_language: code }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.warn(
          "Could not sync language to profile:",
          body.error ?? res.statusText,
        );
      }
    } finally {
      setIsUpdatingLanguage(false);
    }
  }, []);

  const setTranslationEnabled = useCallback((enabled: boolean) => {
    setTranslationEnabledState(enabled);
    setDemoTranslationEnabled(enabled);
  }, []);

  const setProvince = useCallback(async (code: string) => {
    setIsUpdatingProvince(true);
    setProvinceState(code);
    setDemoProvince(code);

    try {
      const res = await fetch("/api/profile/province", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ province: code }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.warn(
          "Could not sync province to profile:",
          body.error ?? res.statusText,
        );
      }
    } finally {
      setIsUpdatingProvince(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      preferredLanguage,
      setPreferredLanguage,
      isUpdatingLanguage,
      translationEnabled,
      setTranslationEnabled,
      province,
      provinceName: getProvinceByCode(province).name,
      setProvince,
      isUpdatingProvince,
    }),
    [
      preferredLanguage,
      setPreferredLanguage,
      isUpdatingLanguage,
      translationEnabled,
      setTranslationEnabled,
      province,
      setProvince,
      isUpdatingProvince,
    ],
  );

  return (
    <DashboardPreferencesContext.Provider value={value}>
      {children}
    </DashboardPreferencesContext.Provider>
  );
}

export function useDashboardPreferences(): DashboardPreferencesContextValue {
  const ctx = useContext(DashboardPreferencesContext);
  if (!ctx) {
    throw new Error(
      "useDashboardPreferences must be used within DashboardPreferencesProvider",
    );
  }
  return ctx;
}

export { DEMO_LANGUAGE_COOKIE };
