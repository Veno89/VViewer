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
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1">
      <button
        type="button"
        onClick={onZoomOut}
        className="rounded p-1 text-gray-600 hover:bg-gray-100"
        aria-label="Zoom out"
      >
        <Minus size={16} />
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
        aria-label="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        type="button"
        onClick={onFitWidth}
        className={`rounded px-2 py-1 text-xs ${zoomMode === 'fit-width' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
        aria-label="Fit to width"
      >
        Fit W
      </button>
      <button
        type="button"
        onClick={onFitPage}
        className={`rounded px-2 py-1 text-xs ${zoomMode === 'fit-page' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'}`}
        aria-label="Fit to page"
      >
        Fit P
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        className="rounded p-1 text-gray-600 hover:bg-gray-100"
        aria-label="Zoom in"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
