import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/config";
import { createServiceClient } from "@/lib/supabase/server";

export async function getOrCreateStripeCustomer(params: {
  userId: string;
  email: string;
  fullName?: string | null;
}): Promise<string | null> {
  if (!stripe) return null;

  const supabase = await createServiceClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, full_name")
    .eq("id", params.userId)
    .single();

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email: params.email,
    name: params.fullName ?? profile?.full_name ?? undefined,
    metadata: { supabase_user_id: params.userId },
  });

  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", params.userId);

  return customer.id;
}

export async function syncSubscriptionToProfile(
  subscription: Stripe.Subscription,
): Promise<void> {
  const supabase = await createServiceClient();
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!profile) return;

  const active =
    subscription.status === "active" || subscription.status === "trialing";

  await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_tier: active ? "pro_all" : "free",
    })
    .eq("id", profile.id);
}
