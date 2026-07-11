"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOUR_STORAGE_KEY = "redseal_dashboard_tour_completed";
const LEARNING_PATH_HREF = "/dashboard/learn";

type TourStep = {
  id: string;
  target?: string;
  title: string;
  description: string;
  placement?: "right" | "bottom" | "center";
};

const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to RedSealGuide",
    description:
      "This quick tour shows you where everything lives so you can study efficiently for your Red Seal exam.",
    placement: "center",
  },
  {
    id: "trade-card",
    target: "tour-trade-card",
    title: "Your trade & readiness",
    description:
      "Your selected trade lives here. As you practice, your exam readiness score updates based on mastery across all RSOS blocks.",
    placement: "right",
  },
  {
    id: "learn",
    target: "tour-nav-learn",
    title: "Start with lessons",
    description:
      "The Learning Path walks you through RSOS-aligned material block by block. Read lessons first to build a strong foundation.",
    placement: "right",
  },
  {
    id: "practice",
    target: "tour-nav-practice",
    title: "Practice questions",
    description:
      "Answer practice questions by block, type, and difficulty. You need at least 3 questions per block to unlock your readiness score.",
    placement: "right",
  },
  {
    id: "mock-exam",
    target: "tour-nav-mock-exam",
    title: "Mock exams",
    description:
      "When you're ready, take a full-length timed mock exam that mirrors the real Red Seal format.",
    placement: "right",
  },
  {
    id: "language",
    target: "tour-language",
    title: "Word translation",
    description:
      "Turn on translation to tap any word in a lesson and see it in your preferred language. Great if English isn't your first language.",
    placement: "right",
  },
  {
    id: "profile",
    target: "tour-profile",
    title: "Profile & settings",
    description:
      "Open your profile to change province, update settings, or log out. Province affects provincial study content in lessons.",
    placement: "bottom",
  },
  {
    id: "finish",
    title: "You're all set!",
    description:
      "Start with your first lesson, then practice questions in that block. Your dashboard will fill in as you go.",
    placement: "center",
  },
];

type TourContextValue = {
  startTour: (options?: { finishHref?: string }) => void;
  isTourActive: boolean;
};

const DashboardTourContext = createContext<TourContextValue | null>(null);

export function useDashboardTour(): TourContextValue {
  const ctx = useContext(DashboardTourContext);
  if (!ctx) {
    throw new Error(
      "useDashboardTour must be used within DashboardTourProvider",
    );
  }
  return ctx;
}

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type TooltipRect = {
  top: number;
  left: number;
  width: number;
};

function getTargetRect(targetId: string): SpotlightRect | null {
  const el = document.querySelector(`[data-tour="${targetId}"]`);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  const padding = 8;
  return {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

function computeTooltipRect(
  spotlight: SpotlightRect | null,
  placement: TourStep["placement"],
  tooltipWidth: number,
  tooltipHeight: number,
): TooltipRect {
  const margin = 16;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (!spotlight || placement === "center") {
    return {
      top: Math.max(margin, (viewportHeight - tooltipHeight) / 2),
      left: Math.max(margin, (viewportWidth - tooltipWidth) / 2),
      width: tooltipWidth,
    };
  }

  if (placement === "right") {
    let left = spotlight.left + spotlight.width + margin;
    let top = spotlight.top;

    if (left + tooltipWidth > viewportWidth - margin) {
      left = Math.max(margin, spotlight.left - tooltipWidth - margin);
    }

    top = Math.min(
      Math.max(margin, top),
      viewportHeight - tooltipHeight - margin,
    );

    return { top, left, width: tooltipWidth };
  }

  let top = spotlight.top + spotlight.height + margin;
  let left = spotlight.left;

  if (top + tooltipHeight > viewportHeight - margin) {
    top = Math.max(margin, spotlight.top - tooltipHeight - margin);
  }

  left = Math.min(
    Math.max(margin, left),
    viewportWidth - tooltipWidth - margin,
  );

  return { top, left, width: tooltipWidth };
}

function DashboardTourOverlay({
  stepIndex,
  finishHref,
  onNext,
  onBack,
  onSkip,
}: {
  stepIndex: number;
  finishHref?: string;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const router = useRouter();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [tooltipRect, setTooltipRect] = useState<TooltipRect | null>(null);

  const step = TOUR_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  const updatePositions = useCallback(() => {
    const nextSpotlight = step.target ? getTargetRect(step.target) : null;
    setSpotlight(nextSpotlight);

    const tooltipWidth = Math.min(360, window.innerWidth - 32);
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 220;
    setTooltipRect(
      computeTooltipRect(
        nextSpotlight,
        step.placement,
        tooltipWidth,
        tooltipHeight,
      ),
    );
  }, [step]);

  useLayoutEffect(() => {
    updatePositions();

    const targetEl = step.target
      ? document.querySelector(`[data-tour="${step.target}"]`)
      : null;
    targetEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });

    const raf = requestAnimationFrame(updatePositions);
    return () => cancelAnimationFrame(raf);
  }, [step, updatePositions]);

  useEffect(() => {
    const raf = requestAnimationFrame(updatePositions);
    return () => cancelAnimationFrame(raf);
  }, [stepIndex, updatePositions]);

  useEffect(() => {
    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions, true);
    return () => {
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions, true);
    };
  }, [updatePositions]);

  const handleSkip = useCallback(() => {
    onSkip();
    router.refresh();
    router.push(LEARNING_PATH_HREF);
  }, [router, onSkip]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleSkip();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip]);

  const handleNext = () => {
    if (isLast && finishHref) {
      router.push(finishHref);
    }
    onNext();
  };

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
      {spotlight ? (
        <div
          className="pointer-events-none fixed rounded-[12px] border-2 border-white/90 transition-all duration-300"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow: "0 0 0 9999px rgba(31, 42, 55, 0.78)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[#1F2A37]/78" />
      )}

      <div
        ref={tooltipRef}
        className={cn(
          "absolute rounded-[14px] border border-[#E5E0D8] bg-white p-5 shadow-[0_20px_50px_rgba(16,24,40,0.18)] transition-all duration-300",
          !tooltipRect && "invisible",
        )}
        style={
          tooltipRect
            ? {
                top: tooltipRect.top,
                left: tooltipRect.left,
                width: tooltipRect.width,
              }
            : undefined
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-[family-name:var(--font-ibm-mono)] text-[11px] font-bold uppercase tracking-wide text-[#C0271E]">
              Step {stepIndex + 1} of {TOUR_STEPS.length}
            </div>
            <h3 className="mt-1 font-[family-name:var(--font-barlow-semi)] text-lg font-bold text-[#1F2A37]">
              {step.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="shrink-0 rounded-md p-1 text-[#94A3B8] transition-colors hover:bg-[#F6F3EE] hover:text-[#64748B]"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-[#64748B]">
          {step.description}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs font-semibold text-[#94A3B8] transition-colors hover:text-[#64748B]"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                Back
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {isLast ? (
                <>
                  Start first lesson <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardTourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const finishHrefRef = useRef<string | undefined>(undefined);

  const endTour = useCallback((completed = false) => {
    if (completed) {
      localStorage.setItem(TOUR_STORAGE_KEY, "1");
    }
    setIsActive(false);
    setStepIndex(0);
    finishHrefRef.current = undefined;
  }, []);

  const startTour = useCallback((options?: { finishHref?: string }) => {
    finishHrefRef.current = options?.finishHref;
    setStepIndex(0);
    setIsActive(true);
  }, []);

  const handleNext = useCallback(() => {
    if (stepIndex >= TOUR_STEPS.length - 1) {
      endTour(true);
      return;
    }
    setStepIndex((index) => index + 1);
  }, [stepIndex, endTour]);

  const handleBack = useCallback(() => {
    setStepIndex((index) => Math.max(0, index - 1));
  }, []);

  return (
    <DashboardTourContext.Provider
      value={{ startTour, isTourActive: isActive }}
    >
      {children}
      {isActive && (
        <DashboardTourOverlay
          stepIndex={stepIndex}
          finishHref={finishHrefRef.current}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={() => endTour(false)}
        />
      )}
    </DashboardTourContext.Provider>
  );
}

export function hasCompletedDashboardTour(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(TOUR_STORAGE_KEY) === "1";
}
