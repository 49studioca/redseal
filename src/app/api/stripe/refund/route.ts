import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { REFUND_WINDOW_MS } from "@/lib/stripe/plans";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST() {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const service = await createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("stripe_customer_id, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_subscription_id || !profile.stripe_customer_id) {
    return NextResponse.json({ error: "No active subscription" }, { status: 404 });
  }

  const subscription = await stripe.subscriptions.retrieve(
    profile.stripe_subscription_id,
  );

  const startedAtMs = subscription.start_date * 1000;
  const withinRefundWindow = Date.now() - startedAtMs <= REFUND_WINDOW_MS;

  if (!withinRefundWindow) {
    return NextResponse.json(
      {
        error:
          "Refunds are only available within 24 hours of starting your plan. After your intro week, payments are non-refundable.",
      },
      { status: 403 },
    );
  }

  const charges = await stripe.charges.list({
    customer: profile.stripe_customer_id,
    limit: 1,
  });
  const latestCharge = charges.data[0];

  if (!latestCharge?.id || latestCharge.refunded) {
    return NextResponse.json(
      { error: "No payment found to refund" },
      { status: 400 },
    );
  }

  await stripe.refunds.create({ charge: latestCharge.id });
  await stripe.subscriptions.cancel(profile.stripe_subscription_id);

  await service
    .from("profiles")
    .update({
      subscription_tier: "free",
      stripe_subscription_id: null,
    })
    .eq("id", user.id);

  return NextResponse.json({ refunded: true });
}
