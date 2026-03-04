import { Minus, Plus } from 'lucide-react';
import type { ZoomMode } from '@/types/pdf';

interface ZoomControlsProps {
  zoom: number;
  zoomMode: ZoomMode;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitWidth: () => void;
  onFitPage: () => void;
}

export function ZoomControls({
  zoom,
  zoomMode,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitWidth,
  onFitPage,
}: ZoomControlsProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-cyan-200/70 bg-white/85 px-2 py-1 shadow-sm backdrop-blur dark:border-cyan-800/60 dark:bg-slate-900/85">
      <button
        type="button"
        onClick={onZoomOut}
        className="rounded p-1 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Zoom out"
        title="Zoom out"
      >
        <Minus size={16} />
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        aria-label="Reset zoom"
        title="Reset zoom to 100%"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        type="button"
        onClick={onFitWidth}
        className={`rounded px-2 py-1 text-xs ${zoomMode === 'fit-width' ? 'bg-cyan-100 text-cyan-900 dark:bg-cyan-900/40 dark:text-cyan-100' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`}
        aria-label="Fit to width"
        title="Fit page to available width"
      >
        Fit W
      </button>
      <button
        type="button"
        onClick={onFitPage}
        className={`rounded px-2 py-1 text-xs ${zoomMode === 'fit-page' ? 'bg-cyan-100 text-cyan-900 dark:bg-cyan-900/40 dark:text-cyan-100' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'}`}
        aria-label="Fit to page"
        title="Fit entire page in view"
      >
        Fit P
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        className="rounded p-1 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Zoom in"
        title="Zoom in"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
