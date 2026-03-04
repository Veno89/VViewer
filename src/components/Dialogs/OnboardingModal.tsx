import { useRef } from 'react';
import { useDialogA11y } from '@/hooks/useDialogA11y';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisableFuture: () => void;
}

const TOUR_STEPS = [
  {
    title: '1. Import and Merge',
    description: 'Drop a PDF to begin, then use Add File in the toolbar to append more pages.',
  },
  {
    title: '2. Reorder and Edit',
    description: 'Drag thumbnails to reorder, rotate pages, and use range selection for quick bulk edits.',
  },
  {
    title: '3. Export or Print',
    description: 'Download the updated PDF or print directly from your browser in one click.',
  },
];

export function OnboardingModal({ isOpen, onClose, onDisableFuture }: OnboardingModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const startButtonRef = useRef<HTMLButtonElement | null>(null);
  useDialogA11y({ isOpen, container: dialogRef.current, onClose, initialFocus: startButtonRef.current });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="VViewer onboarding">
      <div ref={dialogRef} className="w-full max-w-2xl rounded-2xl border border-cyan-200 bg-white p-6 shadow-2xl dark:border-cyan-900/50 dark:bg-slate-950" tabIndex={-1}>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700 dark:text-cyan-300">Welcome to VViewer</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Fast PDF editing. Zero sign-up.</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Everything runs locally in your browser. Your documents stay on your machine.
        </p>

        <div className="mt-5 space-y-3">
          {TOUR_STEPS.map((step) => (
            <div key={step.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{step.title}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            ref={startButtonRef}
            type="button"
            onClick={onClose}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
          >
            Start Editing
          </button>
          <button
            type="button"
            onClick={onDisableFuture}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Don't show again
          </button>
        </div>
      </div>
    </div>
  );
}
