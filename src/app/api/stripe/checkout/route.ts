import { NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe/config";

export async function POST(request: Request) {
  const formData = await request.formData();
  const plan = formData.get("plan") as keyof typeof PLANS;

  if (!stripe || !PLANS[plan]?.priceId) {
    return NextResponse.redirect(new URL("/dashboard/profile?demo=checkout", request.url));
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: PLANS[plan].priceId!, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile?cancel=1`,
  });

  return NextResponse.redirect(session.url!);
}
