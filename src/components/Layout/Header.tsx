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
    <header className="border-b border-cyan-200/50 bg-gradient-to-r from-slate-50 via-cyan-50/70 to-slate-50 px-4 py-3 dark:border-cyan-900/40 dark:from-slate-950 dark:via-cyan-950/30 dark:to-slate-950">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="neon-text text-xl font-semibold tracking-wide text-slate-900 dark:text-slate-100">VViewer</h1>
          <p className="text-xs text-slate-600 dark:text-slate-300">Client-side PDF editor. No account, no telemetry, no ads.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://ko-fi.com/veno89"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-amber-300 bg-amber-500 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-amber-600 dark:border-amber-800"
            aria-label="Support VViewer on Ko-fi"
            title="Support VViewer on Ko-fi"
          >
            Donate
          </a>
          <button
            type="button"
            onClick={onToggleTheme}
            className="rounded-lg border border-cyan-200/70 bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur hover:bg-cyan-50 dark:border-cyan-800/60 dark:bg-slate-900/85 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Toggle dark mode"
            title="Switch between light and dark themes"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <Toolbar {...props} />
        </div>
      </div>
    </header>
  );
}
