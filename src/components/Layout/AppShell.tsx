import { useMemo, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Header } from '@/components/Layout/Header';
import { OperationHistoryPanel } from '@/components/Layout/OperationHistoryPanel';
import { PagePreview } from '@/components/PagePreview/PagePreview';
import { ThumbnailPanel } from '@/components/ThumbnailPanel/ThumbnailPanel';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { usePdfTextSearch } from '@/hooks/usePdfTextSearch';
import { usePdfRenderer } from '@/hooks/usePdfRenderer';
import type { OperationLogEntry, PageInfo, PdfSourceFile, ZoomMode } from '@/types/pdf';

interface AppShellProps {
  sourceFiles: PdfSourceFile[];
  pages: PageInfo[];
  selectedIds: Set<string>;
  activePageId: string | null;
  zoom: number;
  displayZoom: number;
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
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSortOriginal: () => void;
  onRemoveDuplicates: () => void;
  onExtractOdd: () => void;
  onExtractEven: () => void;
  onOpenExportPreview: () => void;
  onOpenKeyboardHelp: () => void;
  onOpenPrivacyPanel: () => void;
  onRestoreSnapshot: (entryId: string) => void;
}

export function AppShell({
  sourceFiles,
  pages,
  selectedIds,
  activePageId,
  zoom,
  displayZoom,
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
  searchQuery,
  onSearchQueryChange,
  onSortOriginal,
  onRemoveDuplicates,
  onExtractOdd,
  onExtractEven,
  onOpenExportPreview,
  onOpenKeyboardHelp,
  onOpenPrivacyPanel,
  onRestoreSnapshot,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { documents, isLoading: isDocumentLoading, error: documentError } = usePdfDocument(sourceFiles);
  const renderIds = useMemo(() => new Set(pages.map((page) => page.id)), [pages]);
  const { thumbnails, isRendering } = usePdfRenderer(pages, documents, renderIds);
  const { matches: searchMatches, isIndexing: isIndexingSearch } = usePdfTextSearch(searchQuery, pages, documents);

  const activePage = useMemo(
    () => pages.find((page) => page.id === activePageId) ?? null,
    [activePageId, pages],
  );

  return (
    <div className="flex h-screen flex-col bg-transparent">
      <Header
        zoom={displayZoom}
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

      <div className="border-b border-cyan-200/50 px-3 py-2 lg:hidden dark:border-cyan-900/40">
        <button
          type="button"
          onClick={() => setIsSidebarOpen((value) => !value)}
          className="inline-flex items-center gap-2 rounded border border-cyan-200/70 bg-white/85 px-3 py-1.5 text-xs text-slate-700 shadow-sm dark:border-cyan-800/60 dark:bg-slate-900/85 dark:text-slate-200"
        >
          {isSidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
          {isSidebarOpen ? 'Hide Pages' : 'Show Pages'}
        </button>
      </div>

      {selectedIds.size > 1 && (
        <div className="border-b border-cyan-200 bg-cyan-50/80 px-3 py-2 text-xs text-cyan-900 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-100">
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
        <aside className={`min-h-0 border-r border-cyan-200/60 bg-white/65 backdrop-blur dark:border-cyan-900/45 dark:bg-slate-950/65 ${isSidebarOpen ? 'block' : 'hidden'} lg:block`}>
          {(isDocumentLoading || isRendering) && (
            <div className="border-b border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">Rendering thumbnails...</div>
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

        <OperationHistoryPanel
          entries={operationLog}
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
          searchMatches={searchMatches}
          isIndexingSearch={isIndexingSearch}
          onOpenSearchMatch={(pageId) => {
            onSelectPage(pageId, false, false);
          }}
          onSortOriginal={onSortOriginal}
          onRemoveDuplicates={onRemoveDuplicates}
          onExtractOdd={onExtractOdd}
          onExtractEven={onExtractEven}
          onOpenExportPreview={onOpenExportPreview}
          onOpenKeyboardHelp={onOpenKeyboardHelp}
          onOpenPrivacyPanel={onOpenPrivacyPanel}
          onRestoreSnapshot={onRestoreSnapshot}
        />
      </main>
    </div>
  );
}
