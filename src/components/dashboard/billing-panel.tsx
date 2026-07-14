"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  ExternalLink,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
} from "lucide-react";
import { AddPaymentMethodForm } from "@/components/dashboard/add-payment-method-form";
import { CancelSubscriptionFlow } from "@/components/dashboard/cancel-subscription-flow";
import { UpgradeButton } from "@/components/subscription/upgrade-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type {
  BillingInvoice,
  BillingPaymentMethod,
  BillingSubscription,
} from "@/lib/stripe/billing-types";

type BillingPayload = {
  demo?: boolean;
  subscriptionTier: string;
  planName: string;
  subscription: BillingSubscription | null;
  paymentMethods: BillingPaymentMethod[];
  invoices: BillingInvoice[];
  error?: string;
};

function formatMoney(amountCents: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amountCents / 100);
  } catch {
    return `$${(amountCents / 100).toFixed(2)}`;
  }
}

function formatDate(unix: number | null): string {
  if (!unix) return "—";
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function titleCasePlan(value: string | null): string {
  if (!value) return "Pro";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function BillingPanel() {
  const [data, setData] = useState<BillingPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingCard, setAddingCard] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<"ok" | "error">("ok");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/billing", {
        credentials: "same-origin",
      });
      const json = (await res.json()) as BillingPayload;
      if (!res.ok) {
        throw new Error(json.error ?? "Could not load billing");
      }
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load billing");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("pm") === "added") {
      setNoticeTone("ok");
      setNotice("Card saved. Renewal will prefer your default payment method.");
      window.history.replaceState({}, "", "/dashboard/billing");
      void load();
    }
  }, [load]);

  const updatePaymentMethods = async (
    action: "set_default" | "remove",
    paymentMethodId: string,
  ) => {
    setActionBusy(`${action}:${paymentMethodId}`);
    setNotice(null);
    try {
      const res = await fetch("/api/stripe/billing/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, paymentMethodId }),
      });
      const json = (await res.json()) as {
        error?: string;
        paymentMethods?: BillingPaymentMethod[];
      };
      if (!res.ok) throw new Error(json.error ?? "Update failed");
      setData((prev) =>
        prev
          ? {
              ...prev,
              paymentMethods: json.paymentMethods ?? prev.paymentMethods,
            }
          : prev,
      );
      setNoticeTone("ok");
      setNotice(
        action === "set_default"
          ? "Default card updated — this is used for renewals first."
          : "Card removed.",
      );
    } catch (err) {
      setNoticeTone("error");
      setNotice(err instanceof Error ? err.message : "Update failed");
    } finally {
      setActionBusy(null);
    }
  };

  const reactivate = async () => {
    setActionBusy("reactivate");
    setNotice(null);
    try {
      const res = await fetch("/api/stripe/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reactivate" }),
      });
      const json = (await res.json()) as {
        error?: string;
        message?: string;
        subscription?: BillingSubscription;
      };
      if (!res.ok) throw new Error(json.error ?? "Could not reactivate");
      setData((prev) =>
        prev
          ? { ...prev, subscription: json.subscription ?? prev.subscription }
          : prev,
      );
      setNoticeTone("ok");
      setNotice(json.message ?? "Subscription reactivated.");
    } catch (err) {
      setNoticeTone("error");
      setNotice(err instanceof Error ? err.message : "Could not reactivate");
    } finally {
      setActionBusy(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center gap-3 py-16 text-[#64748B]">
        <Loader2 className="h-7 w-7 animate-spin" />
        <p className="text-sm">Loading billing…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <Card className="mt-6 p-5">
        <p className="text-sm text-[#B91C1C]">{error}</p>
        <Button
          className="mt-4"
          size="sm"
          variant="secondary"
          onClick={() => void load()}
        >
          Try again
        </Button>
      </Card>
    );
  }

  if (!data) return null;

  const isPaid = data.subscriptionTier !== "free";
  const subscription = data.subscription;
  const endingSoon = Boolean(subscription?.cancelAtPeriodEnd);

  return (
    <div className="mt-5 space-y-4 sm:mt-6">
      {data.demo && (
        <p className="rounded-xl border border-[#F4A11A]/35 bg-[#FFF8EC] px-4 py-3 text-sm text-[#92400E]">
          Demo billing data — connect Stripe to manage live cards and invoices.
        </p>
      )}

      {notice && (
        <p
          className={
            noticeTone === "error"
              ? "rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]"
              : "rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#15803D]"
          }
        >
          {notice}
        </p>
      )}

      <Card className="overflow-hidden p-0">
        <div className="border-b border-[#E5E0D8] bg-gradient-to-br from-[#1F2A37] to-[#2C3A4A] px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#9FB4C7]">
                Current plan
              </div>
              <h2 className="mt-1 font-[family-name:var(--font-barlow-semi)] text-2xl font-bold text-white">
                {data.planName}
              </h2>
              {subscription?.planName && (
                <p className="mt-1 text-sm text-[#9FB4C7]">
                  Billing: {titleCasePlan(subscription.planName)}
                  {subscription.planInterval
                    ? ` · ${subscription.planInterval}ly`
                    : ""}
                </p>
              )}
            </div>
            {endingSoon ? (
              <Badge className="bg-[#F4A11A]/20 text-[#FCD34D]">
                Cancels {formatDate(subscription?.currentPeriodEnd ?? null)}
              </Badge>
            ) : isPaid ? (
              <Badge className="bg-white/15 text-white">Active</Badge>
            ) : (
              <Badge className="bg-white/15 text-white">Free</Badge>
            )}
          </div>
          {isPaid && subscription?.currentPeriodEnd && (
            <p className="mt-4 text-sm text-[#C5D2DE]">
              {endingSoon
                ? `Full access stays until ${formatDate(subscription.currentPeriodEnd)}. No further charges after that.`
                : `Next renewal on ${formatDate(subscription.currentPeriodEnd)}.`}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 px-4 py-4 sm:px-6">
          {!isPaid && <UpgradeButton label="Upgrade to Pro" size="sm" />}
          {isPaid && endingSoon && (
            <Button
              size="sm"
              disabled={actionBusy === "reactivate"}
              onClick={() => void reactivate()}
            >
              {actionBusy === "reactivate" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Reactivating…
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Keep my subscription
                </>
              )}
            </Button>
          )}
          {isPaid && !endingSoon && subscription && (
            <Button
              size="sm"
              variant="ghost"
              className="text-[#B91C1C] hover:bg-[#FEF2F2]"
              onClick={() => setCancelOpen(true)}
            >
              Cancel subscription
            </Button>
          )}
          <Link href="/dashboard/profile">
            <Button size="sm" variant="secondary">
              Back to profile
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#C0271E]" />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-[#1F2A37]">Payment methods</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Add more than one card so renewals don&apos;t fail if a card
              expires or declines. Your default card is charged first.
            </p>
          </div>
          {!addingCard && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="shrink-0"
              onClick={() => setAddingCard(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Add card
            </Button>
          )}
        </div>

        {addingCard && (
          <div className="mt-4 rounded-xl border border-[#E5E0D8] bg-[#FBF9F6] p-4">
            <AddPaymentMethodForm
              onCancel={() => setAddingCard(false)}
              onSuccess={() => {
                setAddingCard(false);
                setNoticeTone("ok");
                setNotice("Card saved.");
                void load();
              }}
            />
          </div>
        )}

        <div className="mt-4 grid gap-3">
          {data.paymentMethods.length === 0 && (
            <p className="rounded-xl border border-dashed border-[#E5E0D8] px-4 py-6 text-center text-sm text-[#64748B]">
              No cards on file yet. Add one to avoid failed renewals.
            </p>
          )}
          {data.paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E0D8] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3EFE8]">
                  <CreditCard className="h-4 w-4 text-[#C0271E]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-semibold text-[#1F2A37]">
                    {pm.brand} ···· {pm.last4}
                    {pm.isDefault && (
                      <Badge className="bg-[#FCEBEC] text-[#C0271E]">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-[#64748B]">
                    Expires {pm.expMonth}/{pm.expYear}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {!pm.isDefault && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={Boolean(actionBusy)}
                    onClick={() =>
                      void updatePaymentMethods("set_default", pm.id)
                    }
                  >
                    {actionBusy === `set_default:${pm.id}` ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Make default"
                    )}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-[#B91C1C] hover:bg-[#FEF2F2]"
                  disabled={Boolean(actionBusy)}
                  onClick={() => void updatePaymentMethods("remove", pm.id)}
                >
                  {actionBusy === `remove:${pm.id}` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#C0271E]" />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-[#1F2A37]">Invoices</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              Past charges and receipts from your subscription.
            </p>
          </div>
        </div>

        <div className="mt-4 divide-y divide-[#ECE6DC] overflow-hidden rounded-xl border border-[#E5E0D8]">
          {data.invoices.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-[#64748B]">
              No invoices yet.
            </p>
          )}
          {data.invoices.map((invoice) => {
            const viewUrl = invoice.hostedInvoiceUrl ?? invoice.invoicePdf;
            return (
              <div
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3"
              >
                <div>
                  <div className="font-semibold text-[#1F2A37]">
                    {invoice.number ?? invoice.id}
                  </div>
                  <div className="text-sm text-[#64748B]">
                    {formatDate(invoice.created)}
                    {" · "}
                    <span className="capitalize">
                      {invoice.status ?? "unknown"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-semibold text-[#1F2A37]">
                    {formatMoney(
                      invoice.amountPaid || invoice.amountDue,
                      invoice.currency,
                    )}
                  </div>
                  {viewUrl && (
                    <a
                      href={viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#C0271E] hover:underline"
                    >
                      View
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {subscription && (
        <CancelSubscriptionFlow
          open={cancelOpen}
          subscription={subscription}
          onClose={() => setCancelOpen(false)}
          onFixPayment={() => setAddingCard(true)}
          onCanceled={(next, accessUntil) => {
            setData((prev) => (prev ? { ...prev, subscription: next } : prev));
            setNoticeTone("ok");
            setNotice(
              accessUntil
                ? `Next payment canceled. Access continues until ${formatDate(accessUntil)}.`
                : "Next payment canceled. You keep access until period end.",
            );
          }}
          onKept={(next) => {
            setData((prev) => (prev ? { ...prev, subscription: next } : prev));
            setNoticeTone("ok");
            setNotice("Glad you're staying — offer applied to your next bill.");
          }}
        />
      )}
    </div>
  );
}
