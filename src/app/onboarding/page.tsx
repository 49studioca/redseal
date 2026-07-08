import { OnboardingForm } from "@/app/onboarding/onboarding-form";
import { resolveUserProvince } from "@/lib/dashboard-session";
import { normalizeProvinceCode } from "@/lib/provinces";

export default async function OnboardingPage() {
  const province = normalizeProvinceCode(await resolveUserProvince());

  return <OnboardingForm initialProvince={province} />;
}
