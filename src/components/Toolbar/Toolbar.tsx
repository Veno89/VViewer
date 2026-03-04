import type { ReactNode } from 'react';
import { Download, Files, Printer, Redo2, RotateCw, Scissors, Trash2, Undo2, Upload } from 'lucide-react';
import { ZoomControls } from '@/components/PagePreview/ZoomControls';
import type { ZoomMode } from '@/types/pdf';

interface ToolbarProps {
  zoom: number;
  zoomMode: ZoomMode;
  hasPages: boolean;
  hasSelection: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onOpenFiles: () => void;
  onAddFiles: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onExtractSelected: () => void;
  onOpenPageRange: () => void;
  onRotateAll: () => void;
  onDeleteSelected: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitWidth: () => void;
  onFitPage: () => void;
}

function ToolbarButton({
  onClick,
  label,
  hint,
  shortcut,
  icon,
  disabled = false,
}: {
  onClick: () => void;
  label: string;
  hint: string;
  shortcut?: string;
  icon: ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-lg border border-cyan-200/70 bg-white/85 px-3 py-1.5 text-sm text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-cyan-800/60 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-cyan-500"
        aria-label={label}
      >
        {icon}
        <span className="hidden md:inline">{label}</span>
      </button>
      <div className="tooltip-bubble pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-52 -translate-x-1/2 opacity-0 transition group-hover:opacity-100">
        <p className="font-medium text-slate-900 dark:text-slate-100">{label}</p>
        <p className="mt-1 text-slate-600 dark:text-slate-300">{hint}</p>
        {shortcut && <p className="mt-1 text-[10px] uppercase tracking-wide text-cyan-700 dark:text-cyan-300">{shortcut}</p>}
      </div>
    </div>
  );
}

export function Toolbar({
  zoom,
  zoomMode,
  hasPages,
  hasSelection,
  canUndo,
  canRedo,
  onOpenFiles,
  onAddFiles,
  onDownload,
  onPrint,
  onExtractSelected,
  onOpenPageRange,
  onRotateAll,
  onDeleteSelected,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitWidth,
  onFitPage,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToolbarButton onClick={onOpenFiles} label="Open" hint="Replace your current document with one or more PDFs." icon={<Upload size={16} />} />
      <ToolbarButton onClick={onAddFiles} label="Add File" hint="Merge another PDF into the current page list." icon={<Files size={16} />} />
      <ToolbarButton
        onClick={onDownload}
        label="Download"
        hint="Export the edited document with order and rotations applied."
        shortcut="Ctrl+S"
        icon={<Download size={16} />}
        disabled={!hasPages}
      />
      <ToolbarButton
        onClick={onPrint}
        label="Print"
        hint="Open your system print dialog with the current edited PDF."
        icon={<Printer size={16} />}
        disabled={!hasPages}
      />
      <ToolbarButton
        onClick={onExtractSelected}
        label="Extract"
        hint="Create a new PDF containing only the currently selected pages."
        icon={<Scissors size={16} />}
        disabled={!hasSelection}
      />
      <ToolbarButton
        onClick={onOpenPageRange}
        label="Select Range"
        hint="Quick select pages with input like 1-3, 7, 10-12."
        icon={<Files size={16} />}
        disabled={!hasPages}
      />
      <ToolbarButton
        onClick={onRotateAll}
        label="Rotate All"
        hint="Rotate every page clockwise by 90 degrees."
        icon={<RotateCw size={16} />}
        disabled={!hasPages}
      />
      <ToolbarButton
        onClick={onDeleteSelected}
        label="Delete Selected"
        hint="Remove selected pages from the document."
        shortcut="Delete"
        icon={<Trash2 size={16} />}
        disabled={!hasSelection}
      />
      <ToolbarButton onClick={onUndo} label="Undo" hint="Revert the latest operation." shortcut="Ctrl+Z" icon={<Undo2 size={16} />} disabled={!canUndo} />
      <ToolbarButton onClick={onRedo} label="Redo" hint="Re-apply an undone operation." shortcut="Ctrl+Shift+Z" icon={<Redo2 size={16} />} disabled={!canRedo} />
      <ZoomControls
        zoom={zoom}
        zoomMode={zoomMode}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onReset={onZoomReset}
        onFitWidth={onFitWidth}
        onFitPage={onFitPage}
      />
    </div>
  );
}
