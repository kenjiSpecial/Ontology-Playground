import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { jaFormatters, jaMessages } from '../locales/ja';

interface TourStep {
  target: string;        // CSS selector for the element to spotlight
  title: string;
  description: string;
  placement: 'bottom' | 'top' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '.header',
    title: jaMessages.tour.steps.navigation.title,
    description: jaMessages.tour.steps.navigation.description,
    placement: 'bottom',
  },
  {
    target: '.graph-container',
    title: jaMessages.tour.steps.graph.title,
    description: jaMessages.tour.steps.graph.description,
    placement: 'bottom',
  },
  {
    target: '.quest-panel',
    title: jaMessages.tour.steps.quests.title,
    description: jaMessages.tour.steps.quests.description,
    placement: 'right',
  },
  {
    target: '.right-sidebar',
    title: jaMessages.tour.steps.inspector.title,
    description: jaMessages.tour.steps.inspector.description,
    placement: 'left',
  },
  {
    target: '.header-actions [data-tour-target="designer"]',
    title: jaMessages.tour.steps.designer.title,
    description: jaMessages.tour.steps.designer.description,
    placement: 'bottom',
  },
];

const STORAGE_KEY = 'ontology-quest-tour-dismissed';

interface GuidedTourProps {
  /** Called when the tour is fully dismissed (skip/finish) */
  onComplete: () => void;
}

/** Check if a DOM element is visible (has non-zero dimensions) */
function isElementVisible(selector: string): boolean {
  const el = document.querySelector(selector);
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

export function GuidedTour({ onComplete }: GuidedTourProps) {
  const [visibleSteps, setVisibleSteps] = useState<TourStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const dismiss = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* noop */ }
    onComplete();
  }, [onComplete]);

  // Filter steps to only those whose target element is visible.
  // On mobile (≤900px), panels like .quest-panel and .right-sidebar are
  // display:none, so they get filtered out. If no steps are visible
  // (e.g. very small screen), auto-dismiss the tour.
  useEffect(() => {
    const visible = tourSteps.filter(s => isElementVisible(s.target));
    if (visible.length === 0) {
      dismiss();
      return;
    }
    setVisibleSteps(visible);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const current = visibleSteps[stepIdx];

  // Measure the target element
  const measure = useCallback(() => {
    if (!current) return;
    const el = document.querySelector(current.target);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, [current]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure]);

  const next = () => {
    if (stepIdx < visibleSteps.length - 1) {
      setStepIdx(s => s + 1);
    } else {
      dismiss();
    }
  };

  const prev = () => {
    if (stepIdx > 0) setStepIdx(s => s - 1);
  };

  // Nothing to show yet (steps still being filtered, or will auto-dismiss)
  if (!current) return null;

  // Compute tooltip position, clamped within the viewport
  const tooltipStyle = (): React.CSSProperties => {
    if (!rect) return { opacity: 0 };
    const pad = 16;
    const margin = 12; // minimum distance from viewport edges
    const base: React.CSSProperties = { position: 'fixed' };

    const clampLeft = (left: number, maxW: number) =>
      Math.max(margin, Math.min(left, window.innerWidth - maxW - margin));

    const clampTop = (top: number) =>
      Math.max(margin, Math.min(top, window.innerHeight - 200));

    switch (current.placement) {
      case 'bottom': {
        const maxW = Math.min(360, rect.width);
        return { ...base, top: clampTop(rect.bottom + pad), left: clampLeft(rect.left, maxW), maxWidth: maxW };
      }
      case 'top': {
        const maxW = Math.min(360, rect.width);
        const top = rect.top - pad - 200; // estimate ~200px tooltip height
        return { ...base, top: Math.max(margin, top), left: clampLeft(rect.left, maxW), maxWidth: maxW };
      }
      case 'right':
        return { ...base, top: clampTop(rect.top), left: Math.min(rect.right + pad, window.innerWidth - 320 - margin), maxWidth: 320 };
      case 'left':
        return { ...base, top: clampTop(rect.top), right: Math.max(margin, window.innerWidth - rect.left + pad), maxWidth: 320 };
    }
  };

  // Spotlight clip-path: full viewport with a rectangular hole
  const clipPath = rect
    ? `polygon(
        0% 0%, 0% 100%, ${rect.left}px 100%, ${rect.left}px ${rect.top}px,
        ${rect.right}px ${rect.top}px, ${rect.right}px ${rect.bottom}px,
        ${rect.left}px ${rect.bottom}px, ${rect.left}px 100%, 100% 100%, 100% 0%
      )`
    : undefined;

  return (
    <AnimatePresence>
      <motion.div
        className="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ clipPath }}
      />
      <motion.div
        className="tour-tooltip"
        key={stepIdx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        style={tooltipStyle()}
      >
        <div className="tour-tooltip-header">
          <span className="tour-tooltip-step">{jaFormatters.tourStep(stepIdx + 1, visibleSteps.length)}</span>
          <button className="tour-tooltip-close" onClick={dismiss} aria-label={jaMessages.tour.close}>
            <X size={16} />
          </button>
        </div>
        <h4 className="tour-tooltip-title">{current.title}</h4>
        <p className="tour-tooltip-desc">{current.description}</p>
        <div className="tour-tooltip-actions">
          {stepIdx > 0 && (
            <button className="tour-btn tour-btn-secondary" onClick={prev}>
              <ChevronLeft size={14} /> {jaMessages.tour.back}
            </button>
          )}
          <button className="tour-btn tour-btn-primary" onClick={next}>
            {stepIdx < visibleSteps.length - 1 ? (
              <>{jaMessages.tour.next} <ChevronRight size={14} /></>
            ) : (
              jaMessages.tour.start
            )}
          </button>
        </div>
        <button className="tour-skip" onClick={dismiss}>
          {jaMessages.tour.skip}
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

/** Returns true if the user previously dismissed the tour */
export function isTourDismissed(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
}
