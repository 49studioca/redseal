import { getDashboardSession } from "@/lib/dashboard-session";
import { getExamReadinessSummaryForTrade } from "@/lib/progress/exam-readiness";
import {
  DashboardHeader,
  DashboardSidebar,
  DashboardMobileNav,
} from "@/components/layout/dashboard-shell";
import { DashboardTradeProvider } from "@/components/layout/dashboard-trade-context";
import { DashboardPreferencesProvider } from "@/components/layout/dashboard-preferences-context";
import { DashboardTourProvider } from "@/components/dashboard/dashboard-tour";
import { UpgradeProvider } from "@/components/subscription/upgrade-provider";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    trade,
    userName,
    isAdmin,
    preferredLanguage,
    translationEnabled,
    province,
    isPremium,
    translationUsage,
  } = await getDashboardSession();
  const readinessSummary = await getExamReadinessSummaryForTrade(
    trade.id,
    trade.pass_percentage,
  );

  return (
    <DashboardTradeProvider trade={trade}>
      <DashboardPreferencesProvider
        preferredLanguage={preferredLanguage}
        translationEnabled={translationEnabled}
        province={province}
        isPremium={isPremium}
        translationUsage={translationUsage}
      >
        <DashboardTourProvider>
          <UpgradeProvider>
            <div className="flex h-screen flex-col overflow-hidden bg-[#F1ECE3]">
              <DashboardHeader
                trade={trade}
                userName={userName}
                isAdmin={isAdmin}
              />
              <div className="flex min-h-0 flex-1 overflow-hidden">
                <div className="hidden md:block">
                  <DashboardSidebar trade={trade} readinessSummary={readinessSummary} />
                </div>
                <main className="dashboard-mobile-content scrl min-w-0 flex-1 overflow-y-auto px-4 pb-[calc(88px+env(safe-area-inset-bottom))] pt-5 sm:px-6 md:p-8">
                  {children}
                </main>
                <DashboardMobileNav />
              </div>
            </div>
          </UpgradeProvider>
        </DashboardTourProvider>
      </DashboardPreferencesProvider>
    </DashboardTradeProvider>
  );
}
