import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import {
  isSubscriptionPlanId,
  type SubscriptionPlanId,
} from "@/lib/stripe/plans";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 },
    );
  }

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const ownerId =
      session.client_reference_id ??
      session.metadata?.supabase_user_id ??
      null;
    if (ownerId && ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const planRaw = session.metadata?.plan;
    const planId =
      planRaw && isSubscriptionPlanId(planRaw)
        ? (planRaw as SubscriptionPlanId)
        : null;

    const amountTotal =
      typeof session.amount_total === "number" ? session.amount_total : null;

    return NextResponse.json({
      transactionId: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      currency: (session.currency ?? "cad").toUpperCase(),
      value: amountTotal !== null ? amountTotal / 100 : null,
      planId,
      subscriptionId:
        typeof session.subscription === "string"
          ? session.subscription
          : (session.subscription?.id ?? null),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load checkout session";
    console.error("checkout-session lookup failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
