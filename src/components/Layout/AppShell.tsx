import { useMemo, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Header } from '@/components/Layout/Header';
import { OperationHistoryPanel } from '@/components/Layout/OperationHistoryPanel';
import { PagePreview } from '@/components/PagePreview/PagePreview';
import { ThumbnailPanel } from '@/components/ThumbnailPanel/ThumbnailPanel';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { usePdfRenderer } from '@/hooks/usePdfRenderer';
import type { OperationLogEntry, PageInfo, PdfSourceFile, ZoomMode } from '@/types/pdf';

interface AppShellProps {
  sourceFiles: PdfSourceFile[];
  pages: PageInfo[];
  selectedIds: Set<string>;
  activePageId: string | null;
  zoom: number;
  zoomMode: ZoomMode;
  canUndo: boolean;
  canRedo: boolean;
  onOpenFiles: () => void;
  onAddFiles: () => void;
  onReorder: (activeId: string, overId: string) => void;
  onSelectPage: (id: string, multi: boolean, range: boolean) => void;
  onRotatePage: (id: string) => void;
  onDeletePage: (id: string) => void;
  onRotateAll: () => void;
  onDeleteSelected: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onExtractSelected: () => void;
  onOpenPageRange: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitWidth: () => void;
  onFitPage: () => void;
  onEffectiveZoomChange: (zoom: number) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  operationLog: OperationLogEntry[];
  onRotateSelected: () => void;
  onClearSelection: () => void;
}

export function AppShell({
  sourceFiles,
  pages,
  selectedIds,
  activePageId,
  zoom,
  zoomMode,
  canUndo,
  canRedo,
  onOpenFiles,
  onAddFiles,
  onReorder,
  onSelectPage,
  onRotatePage,
  onDeletePage,
  onRotateAll,
  onDeleteSelected,
  onUndo,
  onRedo,
  onDownload,
  onPrint,
  onExtractSelected,
  onOpenPageRange,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitWidth,
  onFitPage,
  onEffectiveZoomChange,
  isDarkMode,
  onToggleTheme,
  operationLog,
  onRotateSelected,
  onClearSelection,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { documents, isLoading: isDocumentLoading, error: documentError } = usePdfDocument(sourceFiles);
  const renderIds = useMemo(() => new Set(pages.map((page) => page.id)), [pages]);
  const { thumbnails, isRendering } = usePdfRenderer(pages, documents, renderIds);

  const activePage = useMemo(
    () => pages.find((page) => page.id === activePageId) ?? null,
    [activePageId, pages],
  );

  return (
    <div className="flex h-screen flex-col bg-gray-100 dark:bg-gray-950">
      <Header
        zoom={zoom}
        zoomMode={zoomMode}
        hasPages={pages.length > 0}
        hasSelection={selectedIds.size > 0}
        canUndo={canUndo}
        canRedo={canRedo}
        onOpenFiles={onOpenFiles}
        onAddFiles={onAddFiles}
        onDownload={onDownload}
        onPrint={onPrint}
        onExtractSelected={onExtractSelected}
        onOpenPageRange={onOpenPageRange}
        onRotateAll={onRotateAll}
        onDeleteSelected={onDeleteSelected}
        onUndo={onUndo}
        onRedo={onRedo}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onZoomReset={onZoomReset}
        onFitWidth={onFitWidth}
        onFitPage={onFitPage}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
      />

      <div className="border-b border-gray-200 px-3 py-2 lg:hidden dark:border-gray-700">
        <button
          type="button"
          onClick={() => setIsSidebarOpen((value) => !value)}
          className="inline-flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
        >
          {isSidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
          {isSidebarOpen ? 'Hide Pages' : 'Show Pages'}
        </button>
      </div>

      {selectedIds.size > 1 && (
        <div className="border-b border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>{selectedIds.size} pages selected</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onRotateSelected}
                className="rounded bg-blue-600 px-2.5 py-1 text-white hover:bg-blue-700"
              >
                Rotate Selected
              </button>
              <button
                type="button"
                onClick={onDeleteSelected}
                className="rounded bg-red-600 px-2.5 py-1 text-white hover:bg-red-700"
              >
                Delete Selected
              </button>
              <button
                type="button"
                onClick={onClearSelection}
                className="rounded border border-blue-300 px-2.5 py-1 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900/60"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[260px_1fr_288px]">
        <aside className={`min-h-0 border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 ${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
          {(isDocumentLoading || isRendering) && (
            <div className="border-b border-gray-200 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">Rendering thumbnails...</div>
          )}
          {documentError && (
            <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{documentError}</div>
          )}
          <ThumbnailPanel
            pages={pages}
            activePageId={activePageId}
            selectedIds={selectedIds}
            thumbnails={thumbnails}
            onReorder={onReorder}
            onSelect={onSelectPage}
            onRotate={onRotatePage}
            onDelete={onDeletePage}
          />
        </aside>

        <section className="min-h-0">
          <PagePreview
            activePage={activePage}
            documents={documents}
            zoom={zoom}
            zoomMode={zoomMode}
            onEffectiveZoomChange={onEffectiveZoomChange}
          />
        </section>

        <OperationHistoryPanel entries={operationLog} />
      </main>
    </div>
  );
}
