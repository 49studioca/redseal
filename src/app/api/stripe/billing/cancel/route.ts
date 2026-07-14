import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe } from "@/lib/stripe/config";
import {
  CANCEL_REASONS,
  isCancelReasonId,
  mapSubscription,
  periodEnd,
  requireBillingCustomer,
} from "@/lib/stripe/billing";
import { usesSupabaseData } from "@/lib/supabase/config";

const bodySchema = z.object({
  action: z.enum(["cancel", "reactivate", "accept_offer"]),
  reason: z.string().optional(),
  feedback: z.string().max(2000).optional(),
});

async function applyRetentionDiscount(subscriptionId: string, userId: string) {
  if (!stripe) throw new Error("Stripe is not configured");

  const coupon = await stripe.coupons.create({
    percent_off: 50,
    duration: "once",
    name: "Stay with RedSealGuide — 50% off",
    metadata: {
      supabase_user_id: userId,
      purpose: "cancel_retention",
    },
  });

  try {
    const existing = await stripe.subscriptions.retrieve(subscriptionId);
    return await stripe.subscriptions.update(subscriptionId, {
      discounts: [{ coupon: coupon.id }],
      metadata: {
        ...existing.metadata,
        retention_offer: "50_percent_once",
        retention_accepted_at: new Date().toISOString(),
      },
    });
  } catch {
    const existing = await stripe.subscriptions.retrieve(subscriptionId);
    return await stripe.subscriptions.update(subscriptionId, {
      // @ts-expect-error legacy coupon field for older Stripe account configs
      coupon: coupon.id,
      metadata: {
        ...existing.metadata,
        retention_offer: "50_percent_once",
        retention_accepted_at: new Date().toISOString(),
      },
    });
  }
}

export async function POST(request: Request) {
  if (!usesSupabaseData() || !stripe) {
    return NextResponse.json(
      { error: "Subscription changes are unavailable in demo mode" },
      { status: 400 },
    );
  }

  const auth = await requireBillingCustomer();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!auth.subscriptionId) {
    return NextResponse.json(
      { error: "No active subscription found" },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { action, reason, feedback } = parsed.data;

  try {
    const subscription = await stripe.subscriptions.retrieve(
      auth.subscriptionId,
    );

    if (subscription.status === "canceled") {
      return NextResponse.json(
        { error: "This subscription is already fully canceled." },
        { status: 400 },
      );
    }

    if (action === "reactivate") {
      const updated = await stripe.subscriptions.update(auth.subscriptionId, {
        cancel_at_period_end: false,
      });
      return NextResponse.json({
        ok: true,
        message: "Welcome back — your subscription will continue.",
        subscription: mapSubscription(updated),
      });
    }

    if (action === "accept_offer") {
      const updated = await applyRetentionDiscount(
        auth.subscriptionId,
        auth.userId,
      );
      return NextResponse.json({
        ok: true,
        message: "You're staying — 50% off applied to your next bill.",
        subscription: mapSubscription(updated),
      });
    }

    if (!reason || !isCancelReasonId(reason)) {
      return NextResponse.json(
        { error: "Please tell us why you're leaving" },
        { status: 400 },
      );
    }

    const reasonMeta = CANCEL_REASONS.find((item) => item.id === reason)!;
    const trimmedFeedback = feedback?.trim() ?? "";

    const updated = await stripe.subscriptions.update(auth.subscriptionId, {
      cancel_at_period_end: true,
      cancellation_details: {
        comment: trimmedFeedback.slice(0, 500) || undefined,
        feedback: reasonMeta.stripeFeedback,
      },
      metadata: {
        ...subscription.metadata,
        cancel_reason: reason,
        cancel_feedback: trimmedFeedback.slice(0, 500),
        cancel_requested_at: new Date().toISOString(),
      },
    });

    const endsAt = periodEnd(updated);

    return NextResponse.json({
      ok: true,
      message:
        "Your next payment is canceled. You keep full access until the end of your current period.",
      accessUntil: endsAt,
      subscription: mapSubscription(updated),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not update your subscription";
    console.error("billing cancel failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
