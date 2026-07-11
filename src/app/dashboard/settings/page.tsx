import Link from "next/link";
import { UserDevicesSection } from "@/components/dashboard/user-devices-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PLANS } from "@/lib/stripe/config";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
        Settings
      </h1>

      <Card className="mt-6 p-6">
        <h2 className="font-semibold">Subscription</h2>
        <p className="mt-1 text-sm text-[#64748B]">Current plan: Free</p>
        <div className="mt-4 grid gap-3">
          {Object.entries(PLANS)
            .filter(([k]) => k !== "free")
            .map(([key, plan]) => (
              <form key={key} action="/api/stripe/checkout" method="POST">
                <input type="hidden" name="plan" value={key} />
                <div className="flex items-center justify-between rounded-lg border border-[#E5E0D8] p-4">
                  <div>
                    <div className="font-semibold">{plan.name}</div>
                    <div className="text-sm text-[#64748B]">
                      ${plan.price}/mo
                    </div>
                  </div>
                  <Button type="submit" size="sm">
                    Upgrade
                  </Button>
                </div>
              </form>
            ))}
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="font-semibold">Change trade</h2>
        <p className="mt-1 text-sm text-[#64748B]">
          Switch your primary trade exam
        </p>
        <Link href="/onboarding" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">
            Select different trade
          </Button>
        </Link>
      </Card>

      <UserDevicesSection />
    </div>
  );
}
