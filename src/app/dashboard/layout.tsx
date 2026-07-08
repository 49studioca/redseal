import { getDashboardSession } from "@/lib/dashboard-session";
import {
  DashboardHeader,
  DashboardSidebar,
} from "@/components/layout/dashboard-shell";
import { DashboardTradeProvider } from "@/components/layout/dashboard-trade-context";
import { DashboardPreferencesProvider } from "@/components/layout/dashboard-preferences-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { trade, userName, isAdmin, preferredLanguage } =
    await getDashboardSession();

  return (
    <DashboardTradeProvider trade={trade}>
      <DashboardPreferencesProvider preferredLanguage={preferredLanguage}>
        <div className="flex min-h-screen flex-col bg-[#F1ECE3]">
          <DashboardHeader trade={trade} userName={userName} />
          <div className="flex min-h-0 flex-1">
            <DashboardSidebar trade={trade} readiness={62} isAdmin={isAdmin} />
            <main className="scrl min-w-0 flex-1 overflow-y-auto p-6 md:p-8">
              {children}
            </main>
          </div>
        </div>
      </DashboardPreferencesProvider>
    </DashboardTradeProvider>
  );
}
