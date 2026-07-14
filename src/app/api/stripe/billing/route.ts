import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import {
  mapInvoice,
  mapPaymentMethods,
  mapSubscription,
  requireBillingCustomer,
} from "@/lib/stripe/billing";
import { PLANS } from "@/lib/stripe/config";
import { usesSupabaseData } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!usesSupabaseData() || !stripe) {
    return NextResponse.json({
      demo: true,
      subscriptionTier: "pro_all",
      planName: PLANS.pro_all.name,
      subscription: {
        id: "sub_demo",
        status: "active",
        cancelAtPeriodEnd: false,
        currentPeriodEnd: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
        planName: "monthly",
        planInterval: "month",
      },
      paymentMethods: [
        {
          id: "pm_demo_1",
          brand: "Visa",
          last4: "4242",
          expMonth: 12,
          expYear: 2028,
          isDefault: true,
        },
      ],
      invoices: [
        {
          id: "in_demo_1",
          number: "INV-0001",
          status: "paid",
          amountDue: 799,
          amountPaid: 799,
          currency: "cad",
          created: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60,
          periodStart: Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60,
          periodEnd: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
          hostedInvoiceUrl: null,
          invoicePdf: null,
        },
      ],
    });
  }

  const auth = await requireBillingCustomer();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const customer = await stripe.customers.retrieve(auth.customerId);
    if (customer.deleted) {
      return NextResponse.json(
        { error: "Billing customer not found" },
        { status: 404 },
      );
    }

    const defaultPaymentMethodId =
      typeof customer.invoice_settings.default_payment_method === "string"
        ? customer.invoice_settings.default_payment_method
        : customer.invoice_settings.default_payment_method?.id ?? null;

    const [methodsResult, invoicesResult, subscription] = await Promise.all([
      stripe.paymentMethods.list({
        customer: auth.customerId,
        type: "card",
        limit: 20,
      }),
      stripe.invoices.list({
        customer: auth.customerId,
        limit: 24,
      }),
      auth.subscriptionId
        ? stripe.subscriptions
            .retrieve(auth.subscriptionId, {
              expand: ["items.data.price.product"],
            })
            .catch(() => null)
        : Promise.resolve(null),
    ]);

    let resolvedDefaultId = defaultPaymentMethodId;
    if (!resolvedDefaultId && methodsResult.data[0]) {
      resolvedDefaultId = methodsResult.data[0].id;
      await stripe.customers.update(auth.customerId, {
        invoice_settings: { default_payment_method: resolvedDefaultId },
      });
    }

    const planKey = auth.subscriptionTier as keyof typeof PLANS;
    const planName = PLANS[planKey]?.name ?? "Free";

    return NextResponse.json({
      demo: false,
      subscriptionTier: auth.subscriptionTier,
      planName,
      subscription: subscription ? mapSubscription(subscription) : null,
      paymentMethods: mapPaymentMethods(methodsResult.data, resolvedDefaultId),
      invoices: invoicesResult.data.map(mapInvoice),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load billing";
    console.error("billing GET failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
