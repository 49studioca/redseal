import { BillingPanel } from "@/components/dashboard/billing-panel";

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
        Billing
      </h1>
      <p className="mt-1 text-sm text-[#64748B]">
        Manage payment methods, invoices, and your subscription
      </p>

      <BillingPanel />
    </div>
  );
}
