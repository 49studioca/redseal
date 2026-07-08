import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ received: true, demo: true });
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    // Handle subscription events → update profiles.subscription_tier
    return NextResponse.json({ received: true, type: event.type });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
}
