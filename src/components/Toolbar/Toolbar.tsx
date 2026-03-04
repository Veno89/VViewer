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
  icon,
  disabled = false,
}: {
  onClick: () => void;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={label}
      title={label}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
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
      <ToolbarButton onClick={onOpenFiles} label="Open" icon={<Upload size={16} />} />
      <ToolbarButton onClick={onAddFiles} label="Add File" icon={<Files size={16} />} />
      <ToolbarButton
        onClick={onDownload}
        label="Download"
        icon={<Download size={16} />}
        disabled={!hasPages}
      />
      <ToolbarButton onClick={onPrint} label="Print" icon={<Printer size={16} />} disabled={!hasPages} />
      <ToolbarButton
        onClick={onExtractSelected}
        label="Extract"
        icon={<Scissors size={16} />}
        disabled={!hasSelection}
      />
      <ToolbarButton onClick={onOpenPageRange} label="Select Range" icon={<Files size={16} />} disabled={!hasPages} />
      <ToolbarButton
        onClick={onRotateAll}
        label="Rotate All"
        icon={<RotateCw size={16} />}
        disabled={!hasPages}
      />
      <ToolbarButton
        onClick={onDeleteSelected}
        label="Delete Selected"
        icon={<Trash2 size={16} />}
        disabled={!hasSelection}
      />
      <ToolbarButton onClick={onUndo} label="Undo" icon={<Undo2 size={16} />} disabled={!canUndo} />
      <ToolbarButton onClick={onRedo} label="Redo" icon={<Redo2 size={16} />} disabled={!canRedo} />
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
