import { useCallback, useEffect, useMemo, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Header } from '@/components/Layout/Header';
import { OperationHistoryPanel } from '@/components/Layout/OperationHistoryPanel';
import { PagePreview } from '@/components/PagePreview/PagePreview';
import { ThumbnailPanel } from '@/components/ThumbnailPanel/ThumbnailPanel';
import { usePdfDocument } from '@/hooks/usePdfDocument';
import { usePdfTextSearch } from '@/hooks/usePdfTextSearch';
import { usePdfRenderer } from '@/hooks/usePdfRenderer';
import type { OperationLogEntry, PageInfo, PdfSourceFile, ZoomMode } from '@/types/pdf';
import { createPerformanceModeState, createThumbnailRenderIds } from '@/utils/performanceMode';
import { normalizeSearchMatchIndex, resolveActiveSearchMatchIndex } from '@/utils/searchNavigation';

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
  const [activeSearchMatchIndex, setActiveSearchMatchIndex] = useState(0);
  const [searchAnnouncement, setSearchAnnouncement] = useState('');
  const { documents, isLoading: isDocumentLoading, error: documentError } = usePdfDocument(sourceFiles);
  const performanceMode = useMemo(() => createPerformanceModeState(pages.length), [pages.length]);
  const activePageIndex = useMemo(() => pages.findIndex((page) => page.id === activePageId), [activePageId, pages]);
  const renderIds = useMemo(
    () => createThumbnailRenderIds(pages.map((page) => page.id), activePageIndex, selectedIds, performanceMode.thumbnailRadius),
    [activePageIndex, pages, performanceMode.thumbnailRadius, selectedIds],
  );
  const { thumbnails, isRendering } = usePdfRenderer(pages, documents, renderIds);
  const {
    matches: searchMatches,
    isIndexing: isIndexingSearch,
    highlightsByPage,
    isScanLimited,
    scannedPages,
  } = usePdfTextSearch(searchQuery, pages, documents, {
    maxPagesToScan: performanceMode.searchPageScanLimit,
    includeHighlights: !performanceMode.isLargeDocumentMode,
  });

  const activePage = useMemo(
    () => pages.find((page) => page.id === activePageId) ?? null,
    [activePageId, pages],
  );

  const activeSearchHighlights = activePage ? highlightsByPage[activePage.id] ?? [] : [];
  const searchStatusNote = useMemo(() => {
    if (!performanceMode.isLargeDocumentMode) {
      return '';
    }

    if (searchQuery.trim().length < 2) {
      return `Large document mode active (${performanceMode.pageCount} pages): thumbnail rendering is focused around the active page for responsiveness.`;
    }

    if (isScanLimited) {
      return `Large document mode: search scanned ${scannedPages} of ${performanceMode.pageCount} pages and preview highlights are reduced.`;
    }

    return `Large document mode active (${performanceMode.pageCount} pages): preview highlights are reduced to keep navigation responsive.`;
  }, [isScanLimited, performanceMode.isLargeDocumentMode, performanceMode.pageCount, scannedPages, searchQuery]);

  useEffect(() => {
    setActiveSearchMatchIndex((previous) => resolveActiveSearchMatchIndex(searchMatches, activePageId, previous));
  }, [activePageId, searchMatches]);

  const openSearchMatchAt = useCallback((index: number) => {
    if (searchMatches.length === 0) {
      return;
    }

    const normalizedIndex = normalizeSearchMatchIndex(index, searchMatches.length);
    const target = searchMatches[normalizedIndex];
    if (!target) {
      return;
    }

    setActiveSearchMatchIndex(normalizedIndex);
    onSelectPage(target.pageId, false, false);
  }, [onSelectPage, searchMatches]);

  useEffect(() => {
    if (searchMatches.length === 0) {
      setSearchAnnouncement('');
      return;
    }

    const current = searchMatches[activeSearchMatchIndex];
    if (!current) {
      return;
    }

    setSearchAnnouncement(`Search match ${activeSearchMatchIndex + 1} of ${searchMatches.length}, page ${current.pageNumber}`);
  }, [activeSearchMatchIndex, searchMatches]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (searchMatches.length === 0 || searchQuery.trim().length < 2) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase() ?? '';
      const isEditable =
        target?.isContentEditable ||
        tagName === 'textarea' ||
        tagName === 'input' ||
        tagName === 'select';

      if (isEditable) {
        return;
      }

      if (event.key === 'F3') {
        event.preventDefault();
        if (event.shiftKey) {
          openSearchMatchAt(activeSearchMatchIndex - 1);
        } else {
          openSearchMatchAt(activeSearchMatchIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [activeSearchMatchIndex, openSearchMatchAt, searchMatches.length, searchQuery]);

  return (
    <div className="flex h-screen flex-col bg-transparent">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {searchAnnouncement}
      </div>
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

      {performanceMode.isLargeDocumentMode && (
        <div className="border-b border-amber-200 bg-amber-50/90 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-100">
          Performance mode is enabled for large documents. Thumbnail rendering and search highlighting are reduced to keep interaction smooth.
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
            searchHighlights={activeSearchHighlights}
            onEffectiveZoomChange={onEffectiveZoomChange}
          />
        </section>

        <OperationHistoryPanel
          entries={operationLog}
          searchQuery={searchQuery}
          onSearchQueryChange={onSearchQueryChange}
          searchMatches={searchMatches}
          isIndexingSearch={isIndexingSearch}
          searchStatusNote={searchStatusNote}
          onOpenSearchMatch={(pageId) => {
            onSelectPage(pageId, false, false);
            const selectedIndex = searchMatches.findIndex((match) => match.pageId === pageId);
            if (selectedIndex >= 0) {
              setActiveSearchMatchIndex(selectedIndex);
            }
          }}
          activeSearchMatchIndex={activeSearchMatchIndex}
          onNextSearchMatch={() => {
            openSearchMatchAt(activeSearchMatchIndex + 1);
          }}
          onPreviousSearchMatch={() => {
            openSearchMatchAt(activeSearchMatchIndex - 1);
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
