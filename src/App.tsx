import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { UndoToast } from '@/components/Dialogs/UndoToast';
import { PageRangeDialog } from '@/components/Dialogs/PageRangeDialog';
import { DropZone } from '@/components/DropZone/DropZone';
import { AppShell } from '@/components/Layout/AppShell';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTheme } from '@/hooks/useTheme';
import { downloadPdf, exportPdf } from '@/services/pdfExporter';
import { readFileAsUint8Array } from '@/services/pdfLoader';
import { printPdf } from '@/services/pdfPrinter';
import { usePdfStore } from '@/stores/pdfStore';
import type { OperationLogEntry, PersistedPdfSession, ZoomMode } from '@/types/pdf';
import { parsePageRangeInput } from '@/utils/pageRange';
import { clearPersistedSession, loadPersistedSession, persistSession } from '@/utils/sessionStorage';

const LARGE_FILE_WARNING_BYTES = 50 * 1024 * 1024;
const PERSIST_DEBOUNCE_MS = 600;
const MAX_OPERATION_LOG = 30;

export default function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const undoToastTimerRef = useRef<number | null>(null);
  const [isRangeDialogOpen, setIsRangeDialogOpen] = useState(false);
  const [rangeDialogError, setRangeDialogError] = useState<string | null>(null);
  const [isUndoToastVisible, setIsUndoToastVisible] = useState(false);
  const [undoMessage, setUndoMessage] = useState('Action completed');
  const [restorableSession, setRestorableSession] = useState<PersistedPdfSession | null>(null);
  const [operationLog, setOperationLog] = useState<OperationLogEntry[]>([]);
  const [zoomMode, setZoomMode] = useState<ZoomMode>('manual');
  const [effectiveZoom, setEffectiveZoom] = useState(1);
  const { theme, toggleTheme } = useTheme();

  const sourceFiles = usePdfStore((state) => state.sourceFiles);
  const pages = usePdfStore((state) => state.pages);
  const selectedIds = usePdfStore((state) => state.selectedIds);
  const activePageId = usePdfStore((state) => state.activePageId);
  const zoom = usePdfStore((state) => state.zoom);
  const history = usePdfStore((state) => state.history);
  const future = usePdfStore((state) => state.future);
  const isLoading = usePdfStore((state) => state.isLoading);
  const error = usePdfStore((state) => state.error);

  const loadPdf = usePdfStore((state) => state.loadPdf);
  const reorderPages = usePdfStore((state) => state.reorderPages);
  const rotatePage = usePdfStore((state) => state.rotatePage);
  const rotateAll = usePdfStore((state) => state.rotateAll);
  const deletePage = usePdfStore((state) => state.deletePage);
  const deleteSelected = usePdfStore((state) => state.deleteSelected);
  const selectPage = usePdfStore((state) => state.selectPage);
  const selectAll = usePdfStore((state) => state.selectAll);
  const setSelectedPageIds = usePdfStore((state) => state.setSelectedPageIds);
  const clearSelection = usePdfStore((state) => state.clearSelection);
  const setZoom = usePdfStore((state) => state.setZoom);
  const clearDocument = usePdfStore((state) => state.clearDocument);
  const hydrateSession = usePdfStore((state) => state.hydrateSession);
  const getSessionSnapshot = usePdfStore((state) => state.getSessionSnapshot);
  const undo = usePdfStore((state) => state.undo);
  const redo = usePdfStore((state) => state.redo);
  const setError = usePdfStore((state) => state.setError);

  const addOperationLog = useCallback((label: string): void => {
    const entry: OperationLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
      timestamp: new Date().toISOString(),
    };

    setOperationLog((previous) => [entry, ...previous].slice(0, MAX_OPERATION_LOG));
  }, []);

  useEffect(() => {
    const persisted = loadPersistedSession();
    if (persisted) {
      setRestorableSession(persisted);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      persistSession(getSessionSnapshot());
    }, PERSIST_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [getSessionSnapshot, pages, sourceFiles, selectedIds, activePageId, zoom]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const loadFiles = useCallback(
    async (files: File[]): Promise<void> => {
      for (const file of files) {
        const isPdfType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdfType) {
          setError(`Skipped ${file.name}: only PDF files are supported.`);
          continue;
        }

        if (file.size > LARGE_FILE_WARNING_BYTES) {
          setError(`Warning: ${file.name} is larger than 50 MB and may render slowly.`);
        }

        try {
          const bytes = await readFileAsUint8Array(file);
          await loadPdf(bytes, file.name);
          addOperationLog(`Loaded PDF: ${file.name}`);
        } catch (fileError) {
          const message = fileError instanceof Error ? fileError.message : 'Unknown error';
          setError(`Failed to load ${file.name}: ${message}`);
        }
      }
    },
    [addOperationLog, loadPdf, setError],
  );

  const handleHiddenInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const files = Array.from(event.target.files ?? []).filter((file) => file.type === 'application/pdf');
      if (files.length > 0) {
        await loadFiles(files);
      }

      event.target.value = '';
    },
    [loadFiles],
  );

  const handleDownload = useCallback(async (): Promise<void> => {
    if (pages.length === 0) {
      return;
    }

    try {
      const bytes = await exportPdf(sourceFiles, pages);
      const exportName = `vviewer-edited-${new Date().toISOString().slice(0, 10)}.pdf`;
      downloadPdf(bytes, exportName);
      addOperationLog('Exported edited PDF');
      setError(null);
    } catch (downloadError) {
      const message = downloadError instanceof Error ? downloadError.message : 'Failed to export PDF.';
      setError(message);
    }
  }, [addOperationLog, pages, setError, sourceFiles]);

  const showUndoToast = useCallback((message: string): void => {
    setUndoMessage(message);
    setIsUndoToastVisible(true);

    if (undoToastTimerRef.current !== null) {
      window.clearTimeout(undoToastTimerRef.current);
    }

    undoToastTimerRef.current = window.setTimeout(() => {
      setIsUndoToastVisible(false);
      undoToastTimerRef.current = null;
    }, 5000);
  }, []);

  const handleDeletePage = useCallback(
    (id: string): void => {
      deletePage(id);
      showUndoToast('Page deleted');
      addOperationLog('Deleted one page');
    },
    [addOperationLog, deletePage, showUndoToast],
  );

  const handleDeleteSelected = useCallback((): void => {
    if (selectedIds.size === 0) {
      return;
    }

    deleteSelected();
    showUndoToast('Selected pages deleted');
    addOperationLog('Deleted selected pages');
  }, [addOperationLog, deleteSelected, selectedIds.size, showUndoToast]);

  const handleReorderPages = useCallback(
    (activeId: string, overId: string): void => {
      reorderPages(activeId, overId);
      addOperationLog('Reordered pages');
    },
    [addOperationLog, reorderPages],
  );

  const handleRotateAll = useCallback((): void => {
    rotateAll();
    addOperationLog('Rotated all pages');
  }, [addOperationLog, rotateAll]);

  const handleUndo = useCallback((): void => {
    undo();
    addOperationLog('Undo');
  }, [addOperationLog, undo]);

  const handleRedo = useCallback((): void => {
    redo();
    addOperationLog('Redo');
  }, [addOperationLog, redo]);

  const handleExtractSelected = useCallback(async (): Promise<void> => {
    const selectedPages = pages.filter((page) => selectedIds.has(page.id));
    if (selectedPages.length === 0) {
      setError('Select one or more pages to extract.');
      return;
    }

    try {
      const bytes = await exportPdf(sourceFiles, selectedPages);
      downloadPdf(bytes, 'vviewer-extract.pdf');
      addOperationLog(`Extracted ${selectedPages.length} page(s)`);
      setError(null);
    } catch (extractError) {
      const message = extractError instanceof Error ? extractError.message : 'Failed to extract selected pages.';
      setError(message);
    }
  }, [addOperationLog, pages, selectedIds, setError, sourceFiles]);

  const handlePrint = useCallback(async (): Promise<void> => {
    if (pages.length === 0) {
      return;
    }

    try {
      const bytes = await exportPdf(sourceFiles, pages);
      printPdf(bytes);
      addOperationLog('Sent document to print');
      setError(null);
    } catch (printError) {
      const message = printError instanceof Error ? printError.message : 'Failed to print PDF.';
      setError(message);
    }
  }, [addOperationLog, pages, setError, sourceFiles]);

  useKeyboardShortcuts({
    onDeleteSelected: handleDeleteSelected,
    onSelectAll: selectAll,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDownload: () => {
      void handleDownload();
    },
    onNextPage: () => {
      if (pages.length === 0) {
        return;
      }

      const index = pages.findIndex((page) => page.id === activePageId);
      const nextIndex = index < 0 ? 0 : Math.min(index + 1, pages.length - 1);
      const nextId = pages[nextIndex]?.id;
      if (nextId) {
        selectPage(nextId, false, false);
      }
    },
    onPreviousPage: () => {
      if (pages.length === 0) {
        return;
      }

      const index = pages.findIndex((page) => page.id === activePageId);
      const previousIndex = index < 0 ? 0 : Math.max(index - 1, 0);
      const previousId = pages[previousIndex]?.id;
      if (previousId) {
        selectPage(previousId, false, false);
      }
    },
    onExtendNextPageSelection: () => {
      if (pages.length === 0) {
        return;
      }

      const index = pages.findIndex((page) => page.id === activePageId);
      const nextIndex = index < 0 ? 0 : Math.min(index + 1, pages.length - 1);
      const nextId = pages[nextIndex]?.id;
      if (nextId) {
        selectPage(nextId, false, true);
      }
    },
    onExtendPreviousPageSelection: () => {
      if (pages.length === 0) {
        return;
      }

      const index = pages.findIndex((page) => page.id === activePageId);
      const previousIndex = index < 0 ? 0 : Math.max(index - 1, 0);
      const previousId = pages[previousIndex]?.id;
      if (previousId) {
        selectPage(previousId, false, true);
      }
    },
  });

  const handleApplyPageRange = useCallback(
    (input: string): void => {
      try {
        const selectedIndexes = parsePageRangeInput(input, pages.length);
        const ids = selectedIndexes
          .map((index) => pages[index]?.id)
          .filter((id): id is string => Boolean(id));

        if (ids.length === 0) {
          throw new Error('The range did not match any pages.');
        }

        setSelectedPageIds(ids);
        addOperationLog(`Selected ${ids.length} page(s) via range`);
        setRangeDialogError(null);
        setIsRangeDialogOpen(false);
      } catch (rangeError) {
        const message = rangeError instanceof Error ? rangeError.message : 'Invalid page range.';
        setRangeDialogError(message);
      }
    },
    [addOperationLog, pages, setSelectedPageIds],
  );

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(event) => {
          void handleHiddenInputChange(event);
        }}
      />

      {error && (
        <div className="fixed left-1/2 top-3 z-50 -translate-x-1/2 rounded bg-red-600 px-3 py-2 text-sm text-white shadow-lg">
          {error}
        </div>
      )}

      {pages.length === 0 ? (
        <div className="min-h-screen bg-gray-100 p-6 dark:bg-gray-950">
          <div className="mx-auto mb-4 max-w-3xl">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">VViewer</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Open a PDF to start rearranging, rotating, and exporting pages.</p>
            {restorableSession && (
              <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                <p>
                  Restore previous session from {new Date(restorableSession.savedAt).toLocaleString()}?
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      hydrateSession(restorableSession);
                      setRestorableSession(null);
                      addOperationLog('Restored previous session');
                    }}
                    className="rounded bg-blue-600 px-2.5 py-1 text-white hover:bg-blue-700"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearPersistedSession();
                      clearDocument();
                      setRestorableSession(null);
                    }}
                    className="rounded border border-blue-300 px-2.5 py-1 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900/50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              className="mt-3 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
          <DropZone
            onFilesSelected={(files) => {
              void loadFiles(files);
            }}
            disabled={isLoading}
          />
        </div>
      ) : (
        <AppShell
          sourceFiles={sourceFiles}
          pages={pages}
          selectedIds={selectedIds}
          activePageId={activePageId}
          zoom={effectiveZoom}
          zoomMode={zoomMode}
          canUndo={history.length > 0}
          canRedo={future.length > 0}
          onOpenFiles={openFileDialog}
          onAddFiles={openFileDialog}
          onReorder={handleReorderPages}
          onSelectPage={selectPage}
          onRotatePage={rotatePage}
          onDeletePage={handleDeletePage}
          onRotateAll={handleRotateAll}
          onDeleteSelected={handleDeleteSelected}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onExtractSelected={() => {
            void handleExtractSelected();
          }}
          onOpenPageRange={() => {
            setRangeDialogError(null);
            setIsRangeDialogOpen(true);
          }}
          onDownload={() => {
            void handleDownload();
          }}
          onPrint={() => {
            void handlePrint();
          }}
          onZoomIn={() => {
            setZoomMode('manual');
            setZoom(zoom + 0.1);
          }}
          onZoomOut={() => {
            setZoomMode('manual');
            setZoom(zoom - 0.1);
          }}
          onZoomReset={() => {
            setZoomMode('manual');
            setZoom(1);
          }}
          onFitWidth={() => {
            setZoomMode('fit-width');
          }}
          onFitPage={() => {
            setZoomMode('fit-page');
          }}
          onEffectiveZoomChange={setEffectiveZoom}
          isDarkMode={theme === 'dark'}
          onToggleTheme={toggleTheme}
          operationLog={operationLog}
          onRotateSelected={() => {
            if (selectedIds.size === 0) {
              return;
            }

            selectedIds.forEach((id) => rotatePage(id));
            addOperationLog(`Rotated ${selectedIds.size} selected page(s)`);
          }}
          onClearSelection={() => {
            clearSelection();
          }}
        />
      )}

      <PageRangeDialog
        isOpen={isRangeDialogOpen}
        totalPages={pages.length}
        onClose={() => {
          setIsRangeDialogOpen(false);
          setRangeDialogError(null);
        }}
        onApply={handleApplyPageRange}
        errorMessage={rangeDialogError}
      />

      <UndoToast
        visible={isUndoToastVisible}
        message={undoMessage}
        onUndo={() => {
          handleUndo();
          setIsUndoToastVisible(false);
        }}
      />
    </>
  );
}
