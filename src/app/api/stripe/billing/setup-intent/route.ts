import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { requireBillingCustomer } from "@/lib/stripe/billing";
import { usesSupabaseData } from "@/lib/supabase/config";

export async function POST() {
  if (!usesSupabaseData() || !stripe) {
    return NextResponse.json({
      demo: true,
      clientSecret: null,
      message: "Stripe is not configured in demo mode.",
    });
  }

  const auth = await requireBillingCustomer();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: auth.customerId,
      usage: "off_session",
      metadata: {
        supabase_user_id: auth.userId,
        purpose: "backup_payment_method",
      },
    });

    if (!setupIntent.client_secret) {
      return NextResponse.json(
        { error: "Failed to create setup intent" },
        { status: 500 },
      );
    }

    return NextResponse.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start card setup";
    console.error("setup-intent failed:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
