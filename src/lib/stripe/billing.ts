import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";
import { getServerSessionUser } from "@/lib/supabase/server-auth";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customers";
import type {
  BillingInvoice,
  BillingPaymentMethod,
  BillingSubscription,
} from "@/lib/stripe/billing-types";

export type {
  BillingInvoice,
  BillingPaymentMethod,
  BillingSubscription,
  CancelReasonId,
} from "@/lib/stripe/billing-types";

export {
  CANCEL_REASONS,
  isCancelReasonId,
} from "@/lib/stripe/billing-types";

/** Pulls the current billing-period end across Stripe API versions. */
export function periodEnd(subscription: Stripe.Subscription): number | null {
  const top = (subscription as unknown as { current_period_end?: number })
    .current_period_end;
  if (typeof top === "number") return top;
  const item = subscription.items?.data?.[0] as
    | { current_period_end?: number }
    | undefined;
  return typeof item?.current_period_end === "number"
    ? item.current_period_end
    : null;
}

export function formatCardBrand(brand: string | undefined): string {
  if (!brand) return "Card";
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}

export async function requireBillingCustomer(): Promise<
  | {
      ok: true;
      userId: string;
      email: string;
      customerId: string;
      subscriptionId: string | null;
      subscriptionTier: string;
    }
  | { ok: false; status: number; error: string }
> {
  if (!stripe) {
    return { ok: false, status: 503, error: "Stripe is not configured" };
  }

  const user = await getServerSessionUser();
  if (!user?.email) {
    return { ok: false, status: 401, error: "Authentication required" };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "stripe_customer_id, stripe_subscription_id, subscription_tier, full_name",
    )
    .eq("id", user.id)
    .maybeSingle();

  const customerId =
    profile?.stripe_customer_id ??
    (await getOrCreateStripeCustomer({
      userId: user.id,
      email: user.email,
      fullName: profile?.full_name ?? user.user_metadata?.full_name,
    }));

  if (!customerId) {
    return {
      ok: false,
      status: 500,
      error: "Could not resolve Stripe customer",
    };
  }

  return {
    ok: true,
    userId: user.id,
    email: user.email,
    customerId,
    subscriptionId: profile?.stripe_subscription_id ?? null,
    subscriptionTier: profile?.subscription_tier ?? "free",
  };
}

export function mapPaymentMethods(
  methods: Stripe.PaymentMethod[],
  defaultPaymentMethodId: string | null,
): BillingPaymentMethod[] {
  return methods
    .filter((pm) => pm.type === "card" && pm.card)
    .map((pm) => ({
      id: pm.id,
      brand: formatCardBrand(pm.card!.brand),
      last4: pm.card!.last4,
      expMonth: pm.card!.exp_month,
      expYear: pm.card!.exp_year,
      isDefault: pm.id === defaultPaymentMethodId,
    }));
}

export function mapInvoice(invoice: Stripe.Invoice): BillingInvoice {
  return {
    id: invoice.id,
    number: invoice.number,
    status: invoice.status,
    amountDue: invoice.amount_due,
    amountPaid: invoice.amount_paid,
    currency: invoice.currency,
    created: invoice.created,
    periodStart: invoice.period_start ?? null,
    periodEnd: invoice.period_end ?? null,
    hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
    invoicePdf: invoice.invoice_pdf ?? null,
  };
}

export function mapSubscription(
  subscription: Stripe.Subscription,
): BillingSubscription {
  const item = subscription.items.data[0];
  const price = item?.price;
  const product = price?.product;
  const productName =
    typeof product === "object" && product && !product.deleted
      ? product.name
      : null;

  return {
    id: subscription.id,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodEnd: periodEnd(subscription),
    planName: subscription.metadata?.plan ?? productName,
    planInterval: price?.recurring?.interval ?? null,
  };
}
