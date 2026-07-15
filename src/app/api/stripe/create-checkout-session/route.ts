import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe/config";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customers";
import {
  getPlan,
  isSubscriptionPlanId,
  planHasStripeConfig,
} from "@/lib/stripe/plans";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  planId: z.string(),
});

export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success || !isSubscriptionPlanId(parsed.data.planId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planId = parsed.data.planId;
    const plan = getPlan(planId);

    if (!stripe || !planHasStripeConfig(plan)) {
      return NextResponse.json(
        {
          demo: true,
          clientSecret: null,
          message:
            "Stripe is not configured. Add price IDs from setup-stripe-subscriptions.ts.",
        },
        { status: 200 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const customerId = await getOrCreateStripeCustomer({
      userId: user.id,
      email: user.email,
      fullName: user.user_metadata?.full_name,
    });

    if (!customerId) {
      return NextResponse.json(
        { error: "Could not create customer" },
        { status: 500 },
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: plan.priceId!, quantity: 1 }],
      return_url: `${origin}/dashboard?checkout=success&plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
      subscription_data: {
        metadata: {
          plan: planId,
          supabase_user_id: user.id,
        },
      },
      metadata: {
        plan: planId,
        supabase_user_id: user.id,
      },
    });

    if (!session.client_secret) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      clientSecret: session.client_secret,
      planId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start checkout";
    console.error("create-checkout-session failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
