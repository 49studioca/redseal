import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { createServiceClient } from "@/lib/supabase/server";
import { usesSupabaseData } from "@/lib/supabase/config";
import { stripe } from "@/lib/stripe/config";

export const dynamic = "force-dynamic";

const SUBSCRIPTION_TIERS = [
  "free",
  "pro_trade",
  "pro_all",
  "org_seat",
] as const;

type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

function isSubscriptionTier(value: unknown): value is SubscriptionTier {
  return (
    typeof value === "string" &&
    (SUBSCRIPTION_TIERS as readonly string[]).includes(value)
  );
}

const DEMO_USERS = [
  {
    id: "demo-user-1",
    email: "jordan@example.com",
    full_name: "Jordan Miller",
    subscription_tier: "pro_all",
    is_admin: false,
    province: "ON",
    onboarding_completed: true,
    created_at: "2026-06-01T12:00:00Z",
    stripe_customer_id: "cus_demo1",
    stripe_subscription_id: "sub_demo1",
    trade: { name: "Construction Electrician", code: "309A", slug: "construction-electrician" },
  },
  {
    id: "demo-user-2",
    email: "sam@example.com",
    full_name: "Sam Nguyen",
    subscription_tier: "free",
    is_admin: false,
    province: "AB",
    onboarding_completed: false,
    created_at: "2026-06-20T12:00:00Z",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    trade: null,
  },
];

const LIST_SELECT =
  "id, email, full_name, subscription_tier, is_admin, province, onboarding_completed, created_at, stripe_customer_id, stripe_subscription_id, selected_trade_id, trade:trades(name, code, slug)";

/** Pulls the current billing-period end across Stripe API versions. */
function periodEnd(subscription: Stripe.Subscription): number | null {
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

async function loadStripeDetail(
  customerId: string | null,
  subscriptionId: string | null,
) {
  if (!stripe) return { available: false as const };

  let subscription: {
    id: string;
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: number | null;
    startDate: number;
    plan: string | null;
  } | null = null;

  if (subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      subscription = {
        id: sub.id,
        status: sub.status,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        currentPeriodEnd: periodEnd(sub),
        startDate: sub.start_date,
        plan: sub.metadata?.plan ?? null,
      };
    } catch {
      subscription = null;
    }
  }

  let latestPayment: {
    id: string;
    amount: number;
    currency: string;
    created: number;
    refunded: boolean;
    status: string | null;
    receiptUrl: string | null;
  } | null = null;

  if (customerId) {
    try {
      const charges = await stripe.charges.list({
        customer: customerId,
        limit: 1,
      });
      const charge = charges.data[0];
      if (charge) {
        latestPayment = {
          id: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          created: charge.created,
          refunded: charge.refunded,
          status: charge.status ?? null,
          receiptUrl: charge.receipt_url ?? null,
        };
      }
    } catch {
      latestPayment = null;
    }
  }

  return { available: true as const, subscription, latestPayment };
}

async function loadProgress(userId: string) {
  const supabase = await createServiceClient();

  const [exams, practice, latestExam] = await Promise.all([
    supabase
      .from("exam_attempts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("practice_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("exam_attempts")
      .select("id, status, score, passed, completed_at, started_at")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const { data: mastery } = await supabase
    .from("block_mastery")
    .select("questions_attempted, questions_correct")
    .eq("user_id", userId);

  const attempted = (mastery ?? []).reduce(
    (sum: number, row: { questions_attempted?: number }) =>
      sum + (row.questions_attempted ?? 0),
    0,
  );
  const correct = (mastery ?? []).reduce(
    (sum: number, row: { questions_correct?: number }) =>
      sum + (row.questions_correct ?? 0),
    0,
  );

  return {
    examAttempts: exams.count ?? 0,
    practiceSessions: practice.count ?? 0,
    questionsAttempted: attempted,
    questionsCorrect: correct,
    accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : null,
    latestExam: latestExam.data ?? null,
  };
}

export async function GET(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  const q = url.searchParams.get("q")?.trim();

  if (!usesSupabaseData()) {
    if (id) {
      const user = DEMO_USERS.find((u) => u.id === id) ?? DEMO_USERS[0];
      return NextResponse.json({
        user,
        stripe: { available: false },
        progress: {
          examAttempts: 3,
          practiceSessions: 12,
          questionsAttempted: 240,
          questionsCorrect: 186,
          accuracy: 78,
          latestExam: null,
        },
        auth: null,
        persisted: false,
      });
    }
    const users = q
      ? DEMO_USERS.filter((u) =>
          `${u.email} ${u.full_name}`.toLowerCase().includes(q.toLowerCase()),
        )
      : DEMO_USERS;
    return NextResponse.json({ users, persisted: false });
  }

  try {
    const supabase = await createServiceClient();

    if (id) {
      const { data: user, error } = await supabase
        .from("profiles")
        .select(LIST_SELECT)
        .eq("id", id)
        .single();
      if (error) throw new Error(error.message);

      const [stripeDetail, progress] = await Promise.all([
        loadStripeDetail(
          user.stripe_customer_id ?? null,
          user.stripe_subscription_id ?? null,
        ),
        loadProgress(id),
      ]);

      let authInfo: { lastSignInAt: string | null; createdAt: string | null } | null =
        null;
      try {
        const { data: authData } = await supabase.auth.admin.getUserById(id);
        if (authData?.user) {
          authInfo = {
            lastSignInAt: authData.user.last_sign_in_at ?? null,
            createdAt: authData.user.created_at ?? null,
          };
        }
      } catch {
        authInfo = null;
      }

      return NextResponse.json({
        user,
        stripe: stripeDetail,
        progress,
        auth: authInfo,
        persisted: true,
      });
    }

    let query = supabase
      .from("profiles")
      .select(LIST_SELECT)
      .order("created_at", { ascending: false })
      .limit(200);

    if (q) {
      const safe = q.replace(/[%,()]/g, " ");
      query = query.or(`email.ilike.%${safe}%,full_name.ilike.%${safe}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json({ users: data ?? [], persisted: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load users" },
      { status: 500 },
    );
  }
}

type ActionBody = {
  userId?: string;
  action?: string;
  tier?: string;
  isAdmin?: boolean;
};

export async function POST(request: Request) {
  const auth = await assertAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = (await request.json().catch(() => ({}))) as ActionBody;
  const userId = String(body.userId ?? "").trim();
  const action = String(body.action ?? "").trim();

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  if (!action) {
    return NextResponse.json({ error: "action is required" }, { status: 400 });
  }

  if (!usesSupabaseData()) {
    return NextResponse.json(
      {
        error:
          "Running on demo data — user actions can't be saved. Connect Supabase to manage users.",
      },
      { status: 400 },
    );
  }

  try {
    const supabase = await createServiceClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, subscription_tier, is_admin, stripe_customer_id, stripe_subscription_id")
      .eq("id", userId)
      .single();
    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    switch (action) {
      case "set_tier": {
        if (!isSubscriptionTier(body.tier)) {
          return NextResponse.json(
            { error: "Invalid subscription tier" },
            { status: 400 },
          );
        }
        const { error } = await supabase
          .from("profiles")
          .update({ subscription_tier: body.tier })
          .eq("id", userId);
        if (error) throw new Error(error.message);
        return NextResponse.json({
          ok: true,
          message: `Plan set to ${body.tier}`,
        });
      }

      case "set_admin": {
        const isAdmin = Boolean(body.isAdmin);
        if (userId === auth.userId && !isAdmin) {
          return NextResponse.json(
            { error: "You can't remove your own admin access." },
            { status: 400 },
          );
        }
        const { error } = await supabase
          .from("profiles")
          .update({ is_admin: isAdmin })
          .eq("id", userId);
        if (error) throw new Error(error.message);
        return NextResponse.json({
          ok: true,
          message: isAdmin ? "Granted admin access" : "Revoked admin access",
        });
      }

      case "cancel_subscription": {
        if (!profile.stripe_subscription_id) {
          const { error } = await supabase
            .from("profiles")
            .update({ subscription_tier: "free" })
            .eq("id", userId);
          if (error) throw new Error(error.message);
          return NextResponse.json({
            ok: true,
            message: "No Stripe subscription — set plan to free.",
          });
        }
        if (!stripe) {
          return NextResponse.json(
            { error: "Stripe is not configured" },
            { status: 503 },
          );
        }
        await stripe.subscriptions.update(profile.stripe_subscription_id, {
          cancel_at_period_end: true,
        });
        return NextResponse.json({
          ok: true,
          message:
            "Subscription set to cancel at period end. Pro access stays until then.",
        });
      }

      case "resubscribe": {
        if (!stripe) {
          return NextResponse.json(
            { error: "Stripe is not configured" },
            { status: 503 },
          );
        }
        if (!profile.stripe_subscription_id) {
          return NextResponse.json(
            {
              error:
                "No Stripe subscription to reactivate. Ask the user to subscribe from the pricing page, or grant Pro access with \"Make Pro\".",
            },
            { status: 400 },
          );
        }
        const sub = await stripe.subscriptions.retrieve(
          profile.stripe_subscription_id,
        );
        if (sub.status === "canceled") {
          return NextResponse.json(
            {
              error:
                "This subscription is fully canceled and can't be reactivated. Grant access with \"Make Pro\" or have the user resubscribe from pricing.",
            },
            { status: 400 },
          );
        }
        await stripe.subscriptions.update(profile.stripe_subscription_id, {
          cancel_at_period_end: false,
        });
        const { error } = await supabase
          .from("profiles")
          .update({ subscription_tier: "pro_all" })
          .eq("id", userId);
        if (error) throw new Error(error.message);
        return NextResponse.json({
          ok: true,
          message: "Subscription reactivated — cancellation removed.",
        });
      }

      case "refund_latest": {
        if (!stripe) {
          return NextResponse.json(
            { error: "Stripe is not configured" },
            { status: 503 },
          );
        }
        if (!profile.stripe_customer_id) {
          return NextResponse.json(
            { error: "This user has no Stripe customer / payments." },
            { status: 400 },
          );
        }
        const charges = await stripe.charges.list({
          customer: profile.stripe_customer_id,
          limit: 1,
        });
        const charge = charges.data[0];
        if (!charge?.id) {
          return NextResponse.json(
            { error: "No payment found to refund." },
            { status: 400 },
          );
        }
        if (charge.refunded) {
          return NextResponse.json(
            { error: "The latest payment is already refunded." },
            { status: 400 },
          );
        }
        const refund = await stripe.refunds.create({ charge: charge.id });
        return NextResponse.json({
          ok: true,
          message: `Refunded ${(charge.amount / 100).toFixed(2)} ${charge.currency.toUpperCase()}.`,
          refundId: refund.id,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 },
        );
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Action failed" },
      { status: 500 },
    );
  }
}
