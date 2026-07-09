"use client";

import { useEffect } from "react";
import { ExternalLink, FileText, Loader2, X } from "lucide-react";

function ModalBackdrop({
  open,
  onClose,
  children,
  large,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  large?: boolean;
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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl ${
          large ? "h-[min(90vh,900px)] max-w-5xl" : "max-w-lg"
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reference-pdf-title"
      >
        {children}
      </div>
    </div>
  );
}

export function ReferencePdfModal({
  open,
  onClose,
  title,
  page,
  pdfUrl,
  loading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  page: number | null;
  pdfUrl: string | null;
  loading: boolean;
  error: string | null;
}) {
  return (
    <ModalBackdrop open={open} onClose={onClose} large>
      <div className="flex items-center gap-2 border-b border-[#E5E0D8] bg-[#1F2A37] px-5 py-4 text-white">
        <FileText className="h-5 w-5 shrink-0 text-[#F4A11A]" />
        <div className="min-w-0">
          <h2
            id="reference-pdf-title"
            className="truncate font-[family-name:var(--font-barlow-semi)] text-base font-semibold"
          >
            {title}
          </h2>
          {page ? (
            <p className="font-[family-name:var(--font-ibm-mono)] text-xs text-[#9FBBD2]">
              Page {page}
            </p>
          ) : null}
        </div>
        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto rounded-lg p-1.5 hover:bg-white/10"
            aria-label="Open PDF in new tab"
            title="Open in new tab"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 hover:bg-white/10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 bg-[#F6F3EE]">
        {loading ? (
          <div className="flex h-full min-h-[320px] items-center justify-center gap-2 text-sm text-[#64748B]">
            <Loader2 className="h-5 w-5 animate-spin" />
            Opening PDF…
          </div>
        ) : error ? (
          <div className="flex h-full min-h-[200px] items-center justify-center p-6 text-center text-sm leading-relaxed text-[#64748B]">
            {error}
          </div>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={`${title}${page ? ` — page ${page}` : ""}`}
            className="h-full min-h-[min(70vh,760px)] w-full border-0"
          />
        ) : null}
      </div>
    </ModalBackdrop>
  );
}
