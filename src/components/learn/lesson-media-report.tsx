"use client";

import { useEffect, useState } from "react";
import { Flag, Loader2, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveLessonImageSrc } from "@/lib/storage/lesson-images";

const REPORT_REASONS = [
  { value: "not_related", label: "Not related to lesson content" },
  { value: "broken_media", label: "Broken or won't load" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "other", label: "Other" },
] as const;

type ImageAlternative = {
  src: string;
  alt: string;
  caption?: string;
};

type VideoAlternative = {
  youtubeId: string;
  title: string;
};

function ModalBackdrop({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export type LessonMediaReportProps = {
  lessonId: string;
  blockIndex: number;
  mediaType: "image" | "video";
  mediaSrc: string;
  mediaLabel?: string;
  className?: string;
  compact?: boolean;
};

export function LessonMediaReport({
  lessonId,
  blockIndex,
  mediaType,
  mediaSrc,
  mediaLabel,
  className,
  compact = false,
}: LessonMediaReportProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [submittedReason, setSubmittedReason] = useState("");

  const [findingAlternative, setFindingAlternative] = useState(false);
  const [alternativeLoaded, setAlternativeLoaded] = useState(false);
  const [imageAlternative, setImageAlternative] =
    useState<ImageAlternative | null>(null);
  const [videoAlternative, setVideoAlternative] =
    useState<VideoAlternative | null>(null);
  const [alternativeError, setAlternativeError] = useState<string | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [suggested, setSuggested] = useState(false);

  const resetAlternativeState = () => {
    setFindingAlternative(false);
    setAlternativeLoaded(false);
    setImageAlternative(null);
    setVideoAlternative(null);
    setAlternativeError(null);
    setSuggesting(false);
    setSuggested(false);
  };

  const close = () => {
    setOpen(false);
    if (success) {
      setReason("");
      setDetails("");
      setSuccess(false);
      setError(null);
      setReportId(null);
      setSubmittedReason("");
      resetAlternativeState();
    }
  };

  const handleSubmit = async () => {
    if (!reason) return;
    setSubmitting(true);
    setError(null);
    resetAlternativeState();
    try {
      const res = await fetch("/api/lesson-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: lessonId,
          block_index: blockIndex,
          media_type: mediaType,
          media_src: mediaSrc,
          reason,
          details: details.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit report");
      setReportId(data.id ?? null);
      setSubmittedReason(reason);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit report");
    } finally {
      setSubmitting(false);
    }
  };

  const findAlternative = async (next = false) => {
    setFindingAlternative(true);
    setAlternativeError(null);
    try {
      const res = await fetch(
        next
          ? "/api/lesson-media/alternative"
          : `/api/lesson-media/alternative?lesson_id=${encodeURIComponent(lessonId)}&media_type=${encodeURIComponent(mediaType)}&media_src=${encodeURIComponent(mediaSrc)}`,
        next
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                lesson_id: lessonId,
                media_type: mediaType,
                media_src: mediaSrc,
                youtube_id:
                  mediaType === "video"
                    ? videoAlternative?.youtubeId
                    : undefined,
              }),
            }
          : undefined,
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not find an alternative");
      }

      if (mediaType === "image" && data.alternative) {
        setImageAlternative(data.alternative as ImageAlternative);
        setVideoAlternative(null);
      } else if (mediaType === "video" && data.alternative) {
        setVideoAlternative(data.alternative as VideoAlternative);
        setImageAlternative(null);
      } else {
        throw new Error("No alternative available");
      }

      setAlternativeLoaded(true);
    } catch (err) {
      setAlternativeError(
        err instanceof Error ? err.message : "Could not find an alternative",
      );
    } finally {
      setFindingAlternative(false);
    }
  };

  const suggestAlternative = async () => {
    if (!reportId) return;

    const suggestedSrc =
      mediaType === "image"
        ? imageAlternative?.src
        : videoAlternative?.youtubeId;
    const suggestedLabel =
      mediaType === "image" ? imageAlternative?.alt : videoAlternative?.title;

    if (!suggestedSrc) return;

    setSuggesting(true);
    setAlternativeError(null);
    try {
      const res = await fetch("/api/lesson-reports/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: reportId,
          suggested_src: suggestedSrc,
          suggested_label: suggestedLabel,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save suggestion");
      setSuggested(true);
    } catch (err) {
      setAlternativeError(
        err instanceof Error ? err.message : "Could not save suggestion",
      );
    } finally {
      setSuggesting(false);
    }
  };

  const mediaTypeLabel = mediaType === "image" ? "image" : "video";
  const showFindAlternative =
    success &&
    (submittedReason === "not_related" || submittedReason === "broken_media");

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact
            ? `h-7 w-7 shrink-0 rounded-lg p-0 ${className ?? ""}`
            : `h-7 gap-1 px-2 text-xs ${className ?? ""}`
        }
        aria-label={`Report this ${mediaTypeLabel}`}
      >
        <Flag className="h-3 w-3" />
        {!compact && "Report"}
      </Button>

      <ModalBackdrop open={open} onClose={close}>
        <h3 className="font-semibold">Report {mediaTypeLabel}</h3>
        <p className="mt-1 text-sm text-[#64748B]">
          Flag media that is unrelated, broken, or inappropriate. Our team will
          review and update the lesson.
        </p>
        {mediaLabel && (
          <p
            className="mt-2 truncate text-xs text-[#94A3B8]"
            title={mediaLabel}
          >
            {mediaLabel}
          </p>
        )}

        {!success && (
          <>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-3 w-full rounded-lg border border-[#E5E0D8] p-2 text-sm outline-none focus:border-[#C0271E] focus:ring-1 focus:ring-[#C0271E]/30"
            >
              <option value="">Select a reason…</option>
              {REPORT_REASONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <textarea
              placeholder="Optional details (what's wrong with this media?)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="mt-3 w-full rounded-lg border border-[#E5E0D8] p-3 text-sm outline-none focus:border-[#C0271E] focus:ring-1 focus:ring-[#C0271E]/30"
              rows={3}
            />
          </>
        )}

        {error && <p className="mt-2 text-sm text-[#C0271E]">{error}</p>}
        {success && (
          <p className="mt-2 text-sm text-[#047857]">
            Report submitted — thank you for helping improve this lesson.
          </p>
        )}

        {showFindAlternative && !alternativeLoaded && (
          <div className="mt-4 rounded-xl border border-[#E5E0D8] bg-[#FFFBF7] p-4">
            <p className="text-sm text-[#64748B]">
              {mediaType === "image"
                ? "Want a better match? AI can search Wikimedia Commons using this lesson’s content."
                : "Want a better match? AI can search YouTube using this lesson’s content."}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              disabled={findingAlternative}
              onClick={() => void findAlternative(false)}
            >
              {findingAlternative ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Find alternative
                </>
              )}
            </Button>
          </div>
        )}

        {alternativeError && (
          <p className="mt-2 text-sm text-[#C0271E]">{alternativeError}</p>
        )}

        {alternativeLoaded && mediaType === "image" && imageAlternative && (
          <div className="mt-4 rounded-xl border border-[#E5E0D8] bg-[#F8FAFC] p-3">
            <p className="text-sm font-semibold text-[#1F2A37]">
              Suggested alternative
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveLessonImageSrc(imageAlternative.src)}
              alt={imageAlternative.alt}
              className="mt-2 max-h-36 w-full rounded-lg border border-[#E5E0D8] object-contain bg-white"
            />
            <p className="mt-2 text-xs text-[#64748B]">
              {imageAlternative.caption ?? imageAlternative.alt}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {!suggested ? (
                <Button
                  size="sm"
                  disabled={suggesting || !reportId}
                  onClick={() => void suggestAlternative()}
                >
                  {suggesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Suggest this replacement"
                  )}
                </Button>
              ) : (
                <p className="text-sm text-[#047857]">
                  Suggestion sent to our team.
                </p>
              )}
              <Button
                size="sm"
                variant="ghost"
                disabled={findingAlternative}
                onClick={() => void findAlternative(true)}
              >
                {findingAlternative ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Try another
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {alternativeLoaded && mediaType === "video" && videoAlternative && (
          <div className="mt-4 rounded-xl border border-[#E5E0D8] bg-[#F8FAFC] p-3">
            <p className="text-sm font-semibold text-[#1F2A37]">
              Suggested alternative
            </p>
            <div className="mt-2 overflow-hidden rounded-lg border border-[#E5E0D8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://i.ytimg.com/vi/${videoAlternative.youtubeId}/hqdefault.jpg`}
                alt={videoAlternative.title}
                className="aspect-video w-full object-cover"
              />
            </div>
            <p className="mt-2 text-xs text-[#64748B]">
              {videoAlternative.title}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {!suggested ? (
                <Button
                  size="sm"
                  disabled={suggesting || !reportId}
                  onClick={() => void suggestAlternative()}
                >
                  {suggesting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Suggest this replacement"
                  )}
                </Button>
              ) : (
                <p className="text-sm text-[#047857]">
                  Suggestion sent to our team.
                </p>
              )}
              <Button
                size="sm"
                variant="ghost"
                disabled={findingAlternative}
                onClick={() => void findAlternative(true)}
              >
                {findingAlternative ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Try another
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {!success ? (
            <>
              <Button
                disabled={submitting || !reason}
                onClick={() => void handleSubmit()}
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Submit report"
                )}
              </Button>
              <Button variant="ghost" onClick={close}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={close}>
              Done
            </Button>
          )}
        </div>
      </ModalBackdrop>
    </>
  );
}
