"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Trade } from "@/types";

const DashboardTradeContext = createContext<Trade | null>(null);

export function DashboardTradeProvider({
  trade,
  children,
}: {
  trade: Trade;
  children: ReactNode;
}) {
  return (
    <DashboardTradeContext.Provider value={trade}>
      {children}
    </DashboardTradeContext.Provider>
  );
}

export function useDashboardTrade(): Trade {
  const trade = useContext(DashboardTradeContext);
  if (!trade) {
    throw new Error(
      "useDashboardTrade must be used within DashboardTradeProvider",
    );
  }
  return trade;
}
