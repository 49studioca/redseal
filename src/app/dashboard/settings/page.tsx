import { UserDevicesSection } from "@/components/dashboard/user-devices-section";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
        Settings
      </h1>
      <p className="mt-1 text-sm text-[#64748B]">
        Manage signed-in devices for your account
      </p>

      <UserDevicesSection />
    </div>
  );
}
