"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { resolveLessonImageSrc } from "@/lib/storage/lesson-images";
import type { LessonMediaReportRow } from "@/lib/admin/lesson-media";

const REASON_LABELS: Record<string, string> = {
  not_related: "Not related to content",
  broken_media: "Broken or won't load",
  inappropriate: "Inappropriate",
  other: "Other",
};

function MediaPreview({ report }: { report: LessonMediaReportRow }) {
  if (report.media_type === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolveLessonImageSrc(report.media_src)}
        alt="Reported lesson image"
        className="mt-3 max-h-40 w-full rounded-lg border border-[#E5E0D8] object-contain bg-[#F8FAFC]"
      />
    );
  }

  const videoId = report.media_src.trim();
  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-[#E5E0D8]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt="Reported lesson video"
        className="aspect-video w-full object-cover"
      />
      <p className="px-3 py-2 text-xs text-[#64748B]">YouTube: {videoId}</p>
    </div>
  );
}

function RegeneratePanel({
  report,
  onDone,
}: {
  report: LessonMediaReportRow;
  onDone: () => void;
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regenerate = async (mode: "auto" | "manual") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/lesson-media/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: report.id,
          mode,
          image_src:
            report.media_type === "image" && mode === "manual"
              ? imageSrc.trim() || undefined
              : undefined,
          image_alt:
            report.media_type === "image" && mode === "manual"
              ? imageAlt.trim() || undefined
              : undefined,
          youtube_id:
            report.media_type === "video" && mode === "manual"
              ? youtubeId.trim() || undefined
              : undefined,
          video_title:
            report.media_type === "video" && mode === "manual"
              ? videoTitle.trim() || undefined
              : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Regeneration failed");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regeneration failed");
    } finally {
      setLoading(false);
    }
  };

  if (!panelOpen) {
    return (
      <div className="mt-4">
        {error && <p className="text-sm text-[#C0271E]">{error}</p>}
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setError(null);
            setPanelOpen(true);
          }}
        >
          <Search className="h-4 w-4" />
          Find alternative
        </Button>
      </div>
    );
  }

  const canApplyManual =
    report.media_type === "image"
      ? Boolean(imageSrc.trim())
      : Boolean(youtubeId.trim() && videoTitle.trim());

  return (
    <div className="mt-4 rounded-xl border border-[#F4A11A]/30 bg-[#FFFBEB] p-4">
      <p className="text-sm font-semibold text-[#92400E]">
        Replace unrelated {report.media_type}
      </p>

      {report.media_type === "image" ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-[#92400E]/90">
            AI will read the lesson and find a matching Wikimedia Commons photo.
          </p>
          <input
            value={imageSrc}
            onChange={(e) => setImageSrc(e.target.value)}
            placeholder="Or paste image URL (optional)"
            className="w-full rounded-lg border border-[#E5E0D8] p-2 text-sm outline-none focus:border-[#C0271E]"
          />
          <input
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            placeholder="Alt text (optional with URL)"
            className="w-full rounded-lg border border-[#E5E0D8] p-2 text-sm outline-none focus:border-[#C0271E]"
          />
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-[#92400E]/90">
            AI will read the lesson and find a matching YouTube training video.
          </p>
          <input
            value={youtubeId}
            onChange={(e) => setYoutubeId(e.target.value)}
            placeholder="Or paste YouTube ID or URL (optional)"
            className="w-full rounded-lg border border-[#E5E0D8] p-2 text-sm outline-none focus:border-[#C0271E]"
          />
          <input
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            placeholder="Video title (required with URL)"
            className="w-full rounded-lg border border-[#E5E0D8] p-2 text-sm outline-none focus:border-[#C0271E]"
          />
        </div>
      )}

      {error && <p className="mt-2 text-sm text-[#C0271E]">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={loading}
          onClick={() => void regenerate("auto")}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Find with AI
            </>
          )}
        </Button>
        {canApplyManual && (
          <Button
            size="sm"
            variant="secondary"
            disabled={loading}
            onClick={() => void regenerate("manual")}
          >
            Apply selected
          </Button>
        )}
      </div>
    </div>
  );
}

export function AdminQAClient({
  initialReports,
}: {
  initialReports: LessonMediaReportRow[];
}) {
  const [reports, setReports] = useState(initialReports);
  const [statusFilter, setStatusFilter] = useState("open");
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/lesson-reports?status=${statusFilter}`,
      );
      const data = await res.json();
      if (res.ok) setReports(data.reports ?? []);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (statusFilter === "open" && initialReports.length > 0) return;
    void refresh();
  }, [statusFilter, initialReports.length, refresh]);

  const dismiss = async (reportId: string) => {
    await fetch("/api/admin/lesson-reports/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report_id: reportId, status: "dismissed" }),
    });
    void refresh();
  };

  return (
    <div className="min-h-screen bg-[#F6F3EE] p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#C0271E]"
        >
          <ArrowLeft className="h-4 w-4" /> Admin
        </Link>
        <h1 className="mt-4 text-2xl font-bold">QA Queue</h1>
        <p className="text-sm text-[#64748B]">
          Lesson image and video reports from learners
        </p>

        <div className="mt-4 flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#E5E0D8] bg-white px-3 py-2 text-sm"
          >
            <option value="open">Open</option>
            <option value="triaged">Triaged</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
            <option value="all">All</option>
          </select>
          <Button variant="secondary" size="sm" onClick={() => void refresh()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          {reports.length === 0 ? (
            <Card className="p-6 text-sm text-[#64748B]">
              No lesson media reports in this queue.
            </Card>
          ) : (
            reports.map((report) => {
              const lesson = Array.isArray(report.lesson)
                ? report.lesson[0]
                : report.lesson;
              const trade = lesson
                ? Array.isArray(lesson.trade)
                  ? lesson.trade[0]
                  : lesson.trade
                : null;
              const block = lesson
                ? Array.isArray(lesson.block)
                  ? lesson.block[0]
                  : lesson.block
                : null;

              return (
                <Card key={report.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold">
                        {lesson?.title ?? "Unknown lesson"}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-[#64748B]">
                        {trade && <span>{trade.code}</span>}
                        {block && <span>Block {block.code}</span>}
                        {lesson?.chapter_task_code && (
                          <span>{lesson.chapter_task_code}</span>
                        )}
                        <span className="capitalize">{report.media_type}</span>
                      </div>
                      <div className="mt-1 text-sm text-[#64748B]">
                        {REASON_LABELS[report.reason] ?? report.reason} ·{" "}
                        {report.status}
                      </div>
                      {report.details && (
                        <p className="mt-2 text-sm text-[#475569]">
                          {report.details}
                        </p>
                      )}
                      {lesson?.slug && (
                        <Link
                          href={`/dashboard/learn/${lesson.slug}`}
                          className="mt-2 inline-block text-sm font-medium text-[#C0271E] hover:underline"
                        >
                          View lesson
                        </Link>
                      )}
                    </div>
                    {report.status === "open" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void dismiss(report.id)}
                      >
                        Dismiss
                      </Button>
                    )}
                  </div>

                  <MediaPreview report={report} />

                  {(report.status === "open" || report.status === "triaged") &&
                    (report.reason === "not_related" ||
                      report.reason === "broken_media") && (
                      <RegeneratePanel
                        report={report}
                        onDone={() => void refresh()}
                      />
                    )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
