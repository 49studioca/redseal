import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getServerSessionUser } from "@/lib/supabase/server-auth";
import { usesSupabaseData } from "@/lib/supabase/config";
import { stripe } from "@/lib/stripe/config";

export async function DELETE(request: Request) {
  if (!usesSupabaseData()) {
    return NextResponse.json(
      { error: "Account deletion is unavailable in demo mode" },
      { status: 400 },
    );
  }

  const user = await getServerSessionUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    password?: string;
    confirmation?: string;
  };
  const password = String(body.password ?? "");
  const confirmation = String(body.confirmation ?? "").trim().toUpperCase();

  if (confirmation !== "DELETE") {
    return NextResponse.json(
      { error: 'Type DELETE to confirm account deletion' },
      { status: 400 },
    );
  }

  if (!password) {
    return NextResponse.json(
      { error: "Password is required to delete your account" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  });

  if (verifyError) {
    return NextResponse.json({ error: "Password is incorrect" }, { status: 400 });
  }

  const service = await createServiceClient();
  const { data: profile } = await service
    .from("profiles")
    .select("stripe_subscription_id, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (stripe && profile?.stripe_subscription_id) {
    try {
      await stripe.subscriptions.cancel(profile.stripe_subscription_id);
    } catch {
      // Continue deleting the account even if Stripe cancel fails.
    }
  }

  try {
    await service.storage.from("images").remove([`avatars/${user.id}/avatar.jpg`]);
  } catch {
    // Best-effort cleanup
  }

  const { error: deleteError } = await service.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  await supabase.auth.signOut();

  return NextResponse.json({ ok: true });
}
