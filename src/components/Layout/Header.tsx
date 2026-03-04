import { Toolbar } from '@/components/Toolbar/Toolbar';
import type { ZoomMode } from '@/types/pdf';

interface HeaderProps {
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
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function Header({ isDarkMode, onToggleTheme, ...props }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">VViewer</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Client-side PDF page editor</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <Toolbar {...props} />
        </div>
      </div>
    </header>
  );
}
