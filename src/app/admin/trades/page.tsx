"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Wrench, Loader2, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Trade } from "@/types";

type UiStatus = "active" | "draft";

function toUiStatus(status: Trade["status"]): UiStatus {
  return status === "live" ? "active" : "draft";
}

export default function AdminTradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [persisted, setPersisted] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/trades");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setTrades(data.trades ?? []);
      setPersisted(data.persisted !== false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load trades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (trade: Trade, next: UiStatus) => {
    if (toUiStatus(trade.status) === next) return;
    setSaving(trade.id);
    setError(null);
    try {
      const res = await fetch("/api/admin/trades", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: trade.id, status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      setTrades((prev) =>
        prev.map((t) => (t.id === trade.id ? (data.trade as Trade) : t)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#C0271E]"
        >
          <ArrowLeft className="h-4 w-4" /> Admin
        </Link>
        <div className="mt-4 flex items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
            <Wrench className="h-6 w-6 text-[#C0271E]" /> Trades
          </h1>
        </div>
        <p className="mt-1 text-sm text-[#64748B]">
          Set a trade to <strong>Active</strong> (live) or{" "}
          <strong>Draft</strong> (shown with a &ldquo;Coming soon&rdquo; badge).
        </p>

        {!persisted && !loading ? (
          <div className="mt-4 rounded-lg border border-[#E4C878]/60 bg-[#FBF4DE] p-3 text-sm text-[#8A6D1E]">
            Running on seed data — status changes can&rsquo;t be saved. Connect
            Supabase to persist changes.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-lg border border-[#F4564E]/40 bg-[#FCEBEC] p-3 text-sm text-[#C0271E]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-[#64748B]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading trades…
          </div>
        ) : trades.length === 0 ? (
          <Card className="mt-6 p-10 text-center">
            <p className="text-sm text-[#64748B]">No trades found.</p>
          </Card>
        ) : (
          <div className="mt-6 space-y-2">
            {trades.map((trade) => {
              const ui = toUiStatus(trade.status);
              const isSaving = saving === trade.id;
              return (
                <Card
                  key={trade.id}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                          ui === "active"
                            ? "bg-[#ECFDF5] text-[#047857]"
                            : "bg-[#F1ECE3] text-[#94A3B8]"
                        }`}
                      >
                        {ui}
                      </span>
                      <span className="font-[family-name:var(--font-ibm-mono)] text-xs text-[#94A3B8]">
                        {trade.code}
                      </span>
                    </div>
                    <div className="mt-1 truncate font-semibold text-[#1F2A37]">
                      {trade.name}
                    </div>
                    <Link
                      href={`/trades/${trade.slug}`}
                      target="_blank"
                      className="mt-0.5 inline-flex items-center gap-1 truncate font-[family-name:var(--font-ibm-mono)] text-xs text-[#94A3B8] hover:text-[#C0271E]"
                    >
                      /trades/{trade.slug}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {isSaving ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin text-[#64748B]" />
                    ) : null}
                    <div className="flex overflow-hidden rounded-lg border border-[#E2DCCF]">
                      <button
                        type="button"
                        onClick={() => setStatus(trade, "active")}
                        disabled={isSaving}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition disabled:opacity-50 ${
                          ui === "active"
                            ? "bg-[#047857] text-white"
                            : "bg-white text-[#64748B] hover:bg-[#F1ECE3]"
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus(trade, "draft")}
                        disabled={isSaving}
                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition disabled:opacity-50 ${
                          ui === "draft"
                            ? "bg-[#64748B] text-white"
                            : "bg-white text-[#64748B] hover:bg-[#F1ECE3]"
                        }`}
                      >
                        Draft
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
