import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe/config";
import {
  mapPaymentMethods,
  requireBillingCustomer,
} from "@/lib/stripe/billing";
import { usesSupabaseData } from "@/lib/supabase/config";

const bodySchema = z.object({
  action: z.enum(["set_default", "remove"]),
  paymentMethodId: z.string().min(1),
});

async function listMappedMethods(customerId: string) {
  if (!stripe) return [];

  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return [];

  const defaultPaymentMethodId =
    typeof customer.invoice_settings.default_payment_method === "string"
      ? customer.invoice_settings.default_payment_method
      : customer.invoice_settings.default_payment_method?.id ?? null;

  const methods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
    limit: 20,
  });

  return mapPaymentMethods(methods.data, defaultPaymentMethodId);
}

export async function POST(request: Request) {
  if (!usesSupabaseData() || !stripe) {
    return NextResponse.json(
      { error: "Payment methods can't be changed in demo mode" },
      { status: 400 },
    );
  }

  const auth = await requireBillingCustomer();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { action, paymentMethodId } = parsed.data;

  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    const ownerId =
      typeof paymentMethod.customer === "string"
        ? paymentMethod.customer
        : paymentMethod.customer?.id;

    if (ownerId !== auth.customerId) {
      return NextResponse.json(
        { error: "Payment method not found" },
        { status: 404 },
      );
    }

    if (action === "set_default") {
      await stripe.customers.update(auth.customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      if (auth.subscriptionId) {
        try {
          await stripe.subscriptions.update(auth.subscriptionId, {
            default_payment_method: paymentMethodId,
          });
        } catch {
          // Customer default is enough if subscription update fails.
        }
      }
    }

    if (action === "remove") {
      const customer = await stripe.customers.retrieve(auth.customerId);
      if (customer.deleted) {
        return NextResponse.json(
          { error: "Billing customer not found" },
          { status: 404 },
        );
      }

      const defaultId =
        typeof customer.invoice_settings.default_payment_method === "string"
          ? customer.invoice_settings.default_payment_method
          : customer.invoice_settings.default_payment_method?.id ?? null;

      const remaining = await stripe.paymentMethods.list({
        customer: auth.customerId,
        type: "card",
        limit: 20,
      });

      if (remaining.data.length <= 1 && auth.subscriptionTier !== "free") {
        return NextResponse.json(
          {
            error:
              "Keep at least one card on file while you have an active subscription.",
          },
          { status: 400 },
        );
      }

      await stripe.paymentMethods.detach(paymentMethodId);

      if (defaultId === paymentMethodId) {
        const next = remaining.data.find((pm) => pm.id !== paymentMethodId);
        if (next) {
          await stripe.customers.update(auth.customerId, {
            invoice_settings: { default_payment_method: next.id },
          });
          if (auth.subscriptionId) {
            try {
              await stripe.subscriptions.update(auth.subscriptionId, {
                default_payment_method: next.id,
              });
            } catch {
              // Ignore subscription default update failure.
            }
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      paymentMethods: await listMappedMethods(auth.customerId),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not update payment methods";
    console.error("payment-methods POST failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
