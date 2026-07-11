"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TRADES, getBlocksForTrade } from "@/data/seed";
import {
  DEFAULT_BLOCK_VIDEOS,
  MAX_BLOCK_VIDEOS,
  MIN_BLOCK_VIDEOS,
} from "@/lib/ai/find-block-learning-videos";

type BlockVideoSummary = {
  block_id: string;
  video_count: number;
  question_count: number;
};

export default function AdminVideoLearningPage() {
  const [tradeId, setTradeId] = useState(TRADES[0].id);
  const [summaries, setSummaries] = useState<BlockVideoSummary[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [generatingBlockId, setGeneratingBlockId] = useState<string | null>(
    null,
  );
  const [lastResult, setLastResult] = useState<Record<string, unknown> | null>(
    null,
  );
  const [videoCount, setVideoCount] = useState(DEFAULT_BLOCK_VIDEOS);

  const chapters = useMemo(() => getBlocksForTrade(tradeId), [tradeId]);

  const loadSummaries = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch(
        `/api/admin/block-videos/summary?trade_id=${encodeURIComponent(tradeId)}`,
      );
      const data = await res.json();
      setSummaries(Array.isArray(data.summaries) ? data.summaries : []);
    } catch {
      setSummaries([]);
    } finally {
      setLoadingSummary(false);
    }
  }, [tradeId]);

  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  const summaryByBlock = useMemo(() => {
    const map = new Map<string, BlockVideoSummary>();
    for (const row of summaries) map.set(row.block_id, row);
    return map;
  }, [summaries]);

  const handleTradeChange = (nextTradeId: string) => {
    setTradeId(nextTradeId);
    setLastResult(null);
  };

  const handleGenerate = async (blockId: string, blockName: string) => {
    setGeneratingBlockId(blockId);
    setLastResult(null);

    const res = await fetch("/api/admin/block-videos/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trade_id: tradeId,
        block_id: blockId,
        video_count: videoCount,
      }),
    });
    const data = await res.json();
    setLastResult({ ...data, block_name: blockName });
    setGeneratingBlockId(null);
    await loadSummaries();
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] p-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#C0271E]"
        >
          <ArrowLeft className="h-4 w-4" /> Admin
        </Link>
        <h1 className="mt-4 flex items-center gap-2 font-[family-name:var(--font-barlow-semi)] text-2xl font-bold">
          <Play className="h-6 w-6 text-[#C0271E]" /> Video Learning
        </h1>
        <p className="mt-2 text-sm text-[#64748B]">
          Generate curated YouTube training videos per RSOS block using Jina
          Search, plus comprehension questions after each video. Shorts are
          excluded — only full-length tutorials are saved.
        </p>

        <Card className="mt-6 space-y-4 p-6">
          <div>
            <label className="text-sm font-semibold">Trade</label>
            <select
              value={tradeId}
              onChange={(e) => handleTradeChange(e.target.value)}
              className="mt-1 w-full rounded-lg border p-2"
            >
              {TRADES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">
              Videos per block (saved to database)
            </label>
            <input
              type="number"
              min={MIN_BLOCK_VIDEOS}
              max={MAX_BLOCK_VIDEOS}
              value={videoCount}
              onChange={(e) =>
                setVideoCount(
                  Math.min(
                    MAX_BLOCK_VIDEOS,
                    Math.max(
                      MIN_BLOCK_VIDEOS,
                      Number.parseInt(e.target.value, 10) ||
                        DEFAULT_BLOCK_VIDEOS,
                    ),
                  ),
                )
              }
              className="mt-1 w-full rounded-lg border p-2"
            />
            <p className="mt-1 text-xs text-[#64748B]">
              Jina finds up to {videoCount} full-length YouTube video
              {videoCount === 1 ? "" : "s"} per block, each with 3 check-in
              questions.
            </p>
          </div>
        </Card>

        <div className="mt-6 space-y-3">
          {loadingSummary && (
            <p className="flex items-center gap-2 text-sm text-[#64748B]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading block status…
            </p>
          )}

          {chapters.map((block) => {
            const summary = summaryByBlock.get(block.id);
            const isGenerating = generatingBlockId === block.id;

            return (
              <Card
                key={block.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-[family-name:var(--font-ibm-mono)] text-xs font-medium text-[#C0271E]">
                    Block {block.code}
                  </span>
                  <h3 className="font-semibold text-[#1F2A37]">{block.name}</h3>
                  <p className="mt-1 text-xs text-[#64748B]">
                    {summary ? (
                      <>
                        {summary.video_count} videos · {summary.question_count}{" "}
                        questions
                      </>
                    ) : (
                      "No videos generated yet"
                    )}
                  </p>
                </div>
                <Button
                  onClick={() => handleGenerate(block.id, block.name)}
                  disabled={isGenerating || generatingBlockId !== null}
                  variant={summary ? "secondary" : "primary"}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {summary ? "Regenerate" : "Generate"}
                    </>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        {lastResult && (
          <Card className="mt-6 p-6">
            <h3 className="flex items-center gap-2 font-semibold">
              {lastResult.ok ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
                  Generated for {String(lastResult.block_name ?? "block")}
                </>
              ) : (
                "Generation failed"
              )}
            </h3>
            {"error" in lastResult && (
              <p className="mt-2 text-sm text-[#C0271E]">
                {String(lastResult.error)}
              </p>
            )}
            {"video_count" in lastResult && (
              <p className="mt-2 text-sm text-[#10B981]">
                Saved {String(lastResult.video_count)} videos with{" "}
                {String(lastResult.question_count)} comprehension questions.
                Users can view them in{" "}
                <Link
                  href="/dashboard/video-learning"
                  className="font-semibold text-[#C0271E]"
                >
                  Video Learning
                </Link>
                .
              </p>
            )}
            <pre className="mt-3 overflow-x-auto rounded-lg bg-[#1F2A37] p-4 text-xs text-[#CFE0EE]">
              {JSON.stringify(lastResult, null, 2)}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
}
