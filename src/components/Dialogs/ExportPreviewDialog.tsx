import { useRef } from 'react';
import { useDialogA11y } from '@/hooks/useDialogA11y';
import type { ExportProfile } from '@/services/pdfExporter';

interface ExportPreviewDialogProps {
  isOpen: boolean;
  totalPages: number;
  selectedPages: number;
  profile: ExportProfile;
  progress: number;
  isExporting: boolean;
  onProfileChange: (profile: ExportProfile) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function ExportPreviewDialog({
  isOpen,
  totalPages,
  selectedPages,
  profile,
  progress,
  isExporting,
  onProfileChange,
  onClose,
  onConfirm,
}: ExportPreviewDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  useDialogA11y({ isOpen, container: dialogRef.current, onClose, initialFocus: confirmButtonRef.current });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Export preview">
      <div ref={dialogRef} className="w-full max-w-lg rounded-2xl border border-cyan-200 bg-white p-5 shadow-2xl dark:border-cyan-900/50 dark:bg-slate-950" tabIndex={-1}>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Export Preview</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Review export settings before downloading.</p>

        <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/60">
          <p>Total pages in current document: <strong>{totalPages}</strong></p>
          <p className="mt-1">Selected pages: <strong>{selectedPages}</strong></p>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Export profile</p>
          <div className="mt-2 flex gap-2">
            {(['balanced', 'print', 'web'] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onProfileChange(value)}
                className={`rounded border px-3 py-1 text-xs ${profile === value ? 'border-cyan-500 bg-cyan-50 text-cyan-900 dark:bg-cyan-900/40 dark:text-cyan-100' : 'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200'}`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {isExporting && (
          <div className="mt-4">
            <p className="mb-1 text-xs text-slate-600 dark:text-slate-300">Exporting... {progress}%</p>
            <div className="h-2 rounded bg-slate-200 dark:bg-slate-700">
              <div className="h-2 rounded bg-cyan-600" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            disabled={isExporting}
            className="rounded bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-60"
          >
            {isExporting ? 'Exporting...' : 'Download PDF'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
