"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Loader2,
  Search,
  Shield,
  ShieldOff,
  Crown,
  UserMinus,
  RotateCcw,
  Ban,
  Undo2,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TradeRef = { name: string; code: string; slug: string } | null;

type AdminUser = {
  id: string;
  email: string | null;
  full_name: string | null;
  subscription_tier: "free" | "pro_trade" | "pro_all" | "org_seat";
  is_admin: boolean;
  province: string | null;
  onboarding_completed: boolean;
  created_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  selected_trade_id?: string | null;
  trade: TradeRef;
};

type StripeDetail = {
  available: boolean;
  subscription?: {
    id: string;
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: number | null;
    startDate: number;
    plan: string | null;
  } | null;
  latestPayment?: {
    id: string;
    amount: number;
    currency: string;
    created: number;
    refunded: boolean;
    status: string | null;
    receiptUrl: string | null;
  } | null;
};

type Progress = {
  examAttempts: number;
  practiceSessions: number;
  questionsAttempted: number;
  questionsCorrect: number;
  accuracy: number | null;
  latestExam: {
    status: string;
    score: number | null;
    passed: boolean | null;
    completed_at: string | null;
    started_at: string | null;
  } | null;
};

type UserDetail = {
  user: AdminUser;
  stripe: StripeDetail;
  progress: Progress;
  auth: { lastSignInAt: string | null; createdAt: string | null } | null;
};

const TIER_LABELS: Record<AdminUser["subscription_tier"], string> = {
  free: "Free",
  pro_trade: "Pro (trade)",
  pro_all: "Pro",
  org_seat: "Org seat",
};

function tierIsPro(tier: AdminUser["subscription_tier"]) {
  return tier !== "free";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatUnix(value: number | null | undefined) {
  if (!value) return "—";
  return new Date(value * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [persisted, setPersisted] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setUsers(data.users ?? []);
      setPersisted(data.persisted !== false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load(search.trim() || undefined);
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#C0271E]"
        >
          <ArrowLeft className="h-4 w-4" /> Admin
        </Link>
        <div className="mt-4 flex items-center gap-2">
          <Users className="h-6 w-6 text-[#C0271E]" />
          <h1 className="font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
            Users
          </h1>
        </div>
        <p className="mt-1 text-sm text-[#64748B]">
          Manage plans, subscriptions, refunds, and view each user&rsquo;s trade
          and progress.
        </p>

        <form onSubmit={onSearch} className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        {!persisted && !loading ? (
          <div className="mt-4 rounded-lg border border-[#E4C878]/60 bg-[#FBF4DE] p-3 text-sm text-[#8A6D1E]">
            Running on demo data — actions can&rsquo;t be saved. Connect
            Supabase to manage real users.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-lg border border-[#F4564E]/40 bg-[#FCEBEC] p-3 text-sm text-[#C0271E]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-[#64748B]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
          </div>
        ) : users.length === 0 ? (
          <Card className="mt-6 p-10 text-center">
            <p className="text-sm text-[#64748B]">No users found.</p>
          </Card>
        ) : (
          <div className="mt-6 space-y-2">
            {users.map((u) => (
              <Card
                key={u.id}
                className="flex cursor-pointer items-center justify-between gap-4 p-4 transition hover:border-[#C0271E] hover:shadow-md"
                onClick={() => setSelectedId(u.id)}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold text-[#1F2A37]">
                      {u.full_name || "No name"}
                    </span>
                    {u.is_admin ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#4338CA]">
                        <Shield className="h-3 w-3" /> Admin
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                        tierIsPro(u.subscription_tier)
                          ? "bg-[#ECFDF5] text-[#047857]"
                          : "bg-[#F1ECE3] text-[#94A3B8]"
                      }`}
                    >
                      {TIER_LABELS[u.subscription_tier]}
                    </span>
                  </div>
                  <div className="mt-0.5 truncate text-sm text-[#64748B]">
                    {u.email || "—"}
                  </div>
                  <div className="mt-0.5 truncate font-[family-name:var(--font-ibm-mono)] text-xs text-[#94A3B8]">
                    {u.trade ? `${u.trade.code} · ${u.trade.name}` : "No trade"}
                    {u.province ? ` · ${u.province}` : ""}
                  </div>
                </div>
                <div className="shrink-0 text-right text-xs text-[#94A3B8]">
                  {formatDate(u.created_at)}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedId ? (
        <UserDetailDrawer
          userId={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={() => load(search.trim() || undefined)}
        />
      ) : null}
    </div>
  );
}

function UserDetailDrawer({
  userId,
  onClose,
  onChanged,
}: {
  userId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  const loadDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/users?id=${encodeURIComponent(userId)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setDetail(data as UserDetail);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const runAction = async (
    action: string,
    extra: Record<string, unknown> = {},
    confirmMsg?: string,
  ) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(action);
    setFlash(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Action failed");
      setFlash({ ok: true, message: data.message ?? "Done" });
      await loadDetail();
      onChanged();
    } catch (e) {
      setFlash({
        ok: false,
        message: e instanceof Error ? e.message : "Action failed",
      });
    } finally {
      setBusy(null);
    }
  };

  const u = detail?.user;
  const sub = detail?.stripe?.subscription;
  const payment = detail?.stripe?.latestPayment;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 h-full w-full max-w-md overflow-y-auto bg-[#F6F3EE] shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-[#E5E0D8] bg-[#F6F3EE] px-5 py-4">
          <h2 className="font-[family-name:var(--font-barlow-semi)] text-lg font-bold">
            User details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F1ECE3]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : error ? (
            <div className="rounded-lg border border-[#F4564E]/40 bg-[#FCEBEC] p-3 text-sm text-[#C0271E]">
              {error}
            </div>
          ) : u ? (
            <>
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1F2A37]">
                    {u.full_name || "No name"}
                  </span>
                  {u.is_admin ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#4338CA]">
                      <Shield className="h-3 w-3" /> Admin
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 text-sm text-[#64748B]">
                  {u.email || "—"}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <Detail
                    label="Plan"
                    value={TIER_LABELS[u.subscription_tier]}
                  />
                  <Detail label="Province" value={u.province || "—"} />
                  <Detail
                    label="Trade"
                    value={u.trade ? `${u.trade.code} · ${u.trade.name}` : "—"}
                  />
                  <Detail
                    label="Onboarded"
                    value={u.onboarding_completed ? "Yes" : "No"}
                  />
                  <Detail label="Joined" value={formatDate(u.created_at)} />
                  <Detail
                    label="Last sign-in"
                    value={formatDate(detail?.auth?.lastSignInAt ?? null)}
                  />
                </dl>
              </Card>

              {flash ? (
                <div
                  className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                    flash.ok
                      ? "border-[#047857]/30 bg-[#ECFDF5] text-[#047857]"
                      : "border-[#F4564E]/40 bg-[#FCEBEC] text-[#C0271E]"
                  }`}
                >
                  {flash.ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span>{flash.message}</span>
                </div>
              ) : null}

              {/* Subscription */}
              <Card className="p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#94A3B8]">
                  Subscription
                </h3>
                {detail?.stripe?.available === false ? (
                  <p className="mt-2 text-sm text-[#64748B]">
                    Stripe is not configured.
                  </p>
                ) : sub ? (
                  <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <Detail label="Status" value={sub.status} />
                    <Detail
                      label="Cancels at period end"
                      value={sub.cancelAtPeriodEnd ? "Yes" : "No"}
                    />
                    <Detail label="Plan" value={sub.plan || "—"} />
                    <Detail
                      label="Renews / ends"
                      value={formatUnix(sub.currentPeriodEnd)}
                    />
                  </dl>
                ) : (
                  <p className="mt-2 text-sm text-[#64748B]">
                    No active Stripe subscription.
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {u.subscription_tier === "free" ? (
                    <Button
                      size="sm"
                      onClick={() => runAction("set_tier", { tier: "pro_all" })}
                      disabled={Boolean(busy)}
                    >
                      {busy === "set_tier" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Crown className="h-4 w-4" />
                      )}
                      Make Pro
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        runAction(
                          "set_tier",
                          { tier: "free" },
                          "Set this user's plan to Free? This only changes their access tier, not Stripe billing.",
                        )
                      }
                      disabled={Boolean(busy)}
                    >
                      {busy === "set_tier" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UserMinus className="h-4 w-4" />
                      )}
                      Set Free
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      runAction(
                        "cancel_subscription",
                        {},
                        "Cancel this subscription at period end? The user keeps Pro access until then.",
                      )
                    }
                    disabled={Boolean(busy)}
                  >
                    {busy === "cancel_subscription" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Ban className="h-4 w-4" />
                    )}
                    Cancel sub
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => runAction("resubscribe")}
                    disabled={Boolean(busy)}
                  >
                    {busy === "resubscribe" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Undo2 className="h-4 w-4" />
                    )}
                    Resubscribe
                  </Button>
                </div>
              </Card>

              {/* Payment */}
              <Card className="p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#94A3B8]">
                  Latest payment
                </h3>
                {payment ? (
                  <>
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                      <Detail
                        label="Amount"
                        value={`${(payment.amount / 100).toFixed(2)} ${payment.currency.toUpperCase()}`}
                      />
                      <Detail
                        label="Date"
                        value={formatUnix(payment.created)}
                      />
                      <Detail label="Status" value={payment.status || "—"} />
                      <Detail
                        label="Refunded"
                        value={payment.refunded ? "Yes" : "No"}
                      />
                    </dl>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          runAction(
                            "refund_latest",
                            {},
                            "Refund the latest payment for this user?",
                          )
                        }
                        disabled={Boolean(busy) || payment.refunded}
                      >
                        {busy === "refund_latest" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                        Refund latest
                      </Button>
                      {payment.receiptUrl ? (
                        <a
                          href={payment.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-sm font-semibold text-[#C0271E] hover:underline"
                        >
                          View receipt
                        </a>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-[#64748B]">
                    No payments on record.
                  </p>
                )}
              </Card>

              {/* Progress */}
              <Card className="p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#94A3B8]">
                  Trade progress
                </h3>
                {detail?.progress ? (
                  <>
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                      <Detail
                        label="Mock exams"
                        value={String(detail.progress.examAttempts)}
                      />
                      <Detail
                        label="Practice sessions"
                        value={String(detail.progress.practiceSessions)}
                      />
                      <Detail
                        label="Questions done"
                        value={String(detail.progress.questionsAttempted)}
                      />
                      <Detail
                        label="Accuracy"
                        value={
                          detail.progress.accuracy === null
                            ? "—"
                            : `${detail.progress.accuracy}%`
                        }
                      />
                    </dl>
                    {detail.progress.latestExam ? (
                      <p className="mt-3 text-sm text-[#64748B]">
                        Latest exam:{" "}
                        <span className="font-semibold text-[#1F2A37]">
                          {detail.progress.latestExam.score != null
                            ? `${Math.round(detail.progress.latestExam.score)}%`
                            : detail.progress.latestExam.status}
                        </span>
                        {detail.progress.latestExam.passed != null
                          ? detail.progress.latestExam.passed
                            ? " · Passed"
                            : " · Not passed"
                          : ""}{" "}
                        · {formatDate(detail.progress.latestExam.completed_at)}
                      </p>
                    ) : null}
                  </>
                ) : null}
              </Card>

              {/* Admin access */}
              <Card className="p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#94A3B8]">
                  Admin access
                </h3>
                <div className="mt-3">
                  {u.is_admin ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        runAction(
                          "set_admin",
                          { isAdmin: false },
                          "Revoke admin access for this user?",
                        )
                      }
                      disabled={Boolean(busy)}
                    >
                      {busy === "set_admin" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ShieldOff className="h-4 w-4" />
                      )}
                      Revoke admin
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        runAction(
                          "set_admin",
                          { isAdmin: true },
                          "Grant admin access to this user?",
                        )
                      }
                      disabled={Boolean(busy)}
                    >
                      {busy === "set_admin" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Shield className="h-4 w-4" />
                      )}
                      Make admin
                    </Button>
                  )}
                </div>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-[#94A3B8]">{label}</dt>
      <dd className="font-medium text-[#1F2A37]">{value}</dd>
    </div>
  );
}
