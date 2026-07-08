"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEMO_LANGUAGE_COOKIE, setDemoLanguage } from "@/lib/demo-preferences";

type DashboardPreferencesContextValue = {
  preferredLanguage: string;
  setPreferredLanguage: (code: string) => Promise<void>;
  isUpdatingLanguage: boolean;
};

const DashboardPreferencesContext =
  createContext<DashboardPreferencesContextValue | null>(null);

export function DashboardPreferencesProvider({
  preferredLanguage: initialLanguage,
  children,
}: {
  preferredLanguage: string;
  children: ReactNode;
}) {
  const [preferredLanguage, setLanguageState] = useState(initialLanguage);
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false);

  const setPreferredLanguage = useCallback(async (code: string) => {
    setIsUpdatingLanguage(true);
    setLanguageState(code);
    setDemoLanguage(code);

    try {
      await fetch("/api/profile/language", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferred_language: code }),
      });
    } finally {
      setIsUpdatingLanguage(false);
    }
  }, []);

  const value = useMemo(
    () => ({ preferredLanguage, setPreferredLanguage, isUpdatingLanguage }),
    [preferredLanguage, setPreferredLanguage, isUpdatingLanguage],
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
