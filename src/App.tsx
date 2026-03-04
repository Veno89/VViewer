import { useCallback, useEffect, useRef, useState } from 'react';
import { ExportPreviewDialog } from '@/components/Dialogs/ExportPreviewDialog';
import { KeyboardHelpDialog } from '@/components/Dialogs/KeyboardHelpDialog';
import { OnboardingModal } from '@/components/Dialogs/OnboardingModal';
import { PageRangeDialog } from '@/components/Dialogs/PageRangeDialog';
import { PrivacyPanelDialog } from '@/components/Dialogs/PrivacyPanelDialog';
import { UndoToast } from '@/components/Dialogs/UndoToast';
import { DropZone } from '@/components/DropZone/DropZone';
import { AppShell } from '@/components/Layout/AppShell';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useOperationLog } from '@/hooks/useOperationLog';
import { usePdfImport } from '@/hooks/usePdfImport';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { useTheme } from '@/hooks/useTheme';
import { usePdfStore } from '@/stores/pdfStore';
import type { ZoomMode } from '@/types/pdf';
import { parsePageRangeInput } from '@/utils/pageRange';
import { dedupePagesBySource, sortPagesByOriginalOrder } from '@/utils/pageTools';
import { loadSessionPersistenceMode, saveSessionPersistenceMode } from '@/utils/privacySettings';

const LARGE_FILE_WARNING_BYTES = 50 * 1024 * 1024;
const PERSIST_DEBOUNCE_MS = 600;
const MAX_SESSION_HISTORY = 5;
const ONBOARDING_STORAGE_KEY = 'vviewer-onboarding-hidden';
const LATEST_CHANGELOG_ITEMS = [
  'Search page text directly from the in-editor power panel',
  'Session restore timeline with jump-to-snapshot support',
  'Smart tools: sort original, dedupe, and odd/even extraction',
  'Export preview with profile presets and progress tracking',
];

export default function App() {
  const undoToastTimerRef = useRef<number | null>(null);

  const [isRangeDialogOpen, setIsRangeDialogOpen] = useState(false);
  const [rangeDialogError, setRangeDialogError] = useState<string | null>(null);
  const [isUndoToastVisible, setIsUndoToastVisible] = useState(false);
  const [undoMessage, setUndoMessage] = useState('Action completed');
  const [zoomMode, setZoomMode] = useState<ZoomMode>('manual');
  const [effectiveZoom, setEffectiveZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionPersistenceMode, setSessionPersistenceMode] = useState(loadSessionPersistenceMode);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isExportPreviewOpen, setIsExportPreviewOpen] = useState(false);
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);
  const [isPrivacyPanelOpen, setIsPrivacyPanelOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { operationLog, liveAnnouncement, addOperationLogFromCurrentState } = useOperationLog();

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
  const restorePagesSnapshot = usePdfStore((state) => state.restorePagesSnapshot);
  const hydrateSession = usePdfStore((state) => state.hydrateSession);
  const getSessionSnapshot = usePdfStore((state) => state.getSessionSnapshot);
  const undo = usePdfStore((state) => state.undo);
  const redo = usePdfStore((state) => state.redo);
  const setError = usePdfStore((state) => state.setError);

  useEffect(() => {
    const hideOnboarding = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (hideOnboarding !== 'true') {
      setIsOnboardingOpen(true);
    }
  }, []);

  const {
    restorableSession,
    sessionHistory,
    restorePreviousSession,
    dismissPreviousSession,
    restoreHistorySnapshot,
  } = useSessionRecovery({
    maxSessionHistory: MAX_SESSION_HISTORY,
    persistDebounceMs: PERSIST_DEBOUNCE_MS,
    sessionPersistenceMode,
    getSessionSnapshot,
    persistDeps: [pages, sourceFiles, selectedIds, activePageId, zoom],
    hydrateSession,
    clearDocument,
    addOperationLogFromCurrentState,
  });

  useEffect(() => {
    saveSessionPersistenceMode(sessionPersistenceMode);
  }, [sessionPersistenceMode]);

  const { fileInputRef, openFileDialog, loadFiles, handleHiddenInputChange } = usePdfImport({
    loadPdf,
    setError,
    onPdfLoaded: (fileName) => {
      addOperationLogFromCurrentState(`Loaded PDF: ${fileName}`);
    },
    maxFileWarningBytes: LARGE_FILE_WARNING_BYTES,
  });

  const {
    exportProfile,
    setExportProfile,
    exportProgress,
    isExporting,
    handleDownload,
    handleExtractSelected,
    handleExtractOdd,
    handleExtractEven,
    handlePrint,
  } = usePdfExport({
    sourceFiles,
    pages,
    selectedIds,
    setError,
    addOperationLogFromCurrentState,
  });

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
      addOperationLogFromCurrentState('Deleted one page');
    },
    [addOperationLogFromCurrentState, deletePage, showUndoToast],
  );

  const handleDeleteSelected = useCallback((): void => {
    if (selectedIds.size === 0) {
      return;
    }

    deleteSelected();
    showUndoToast('Selected pages deleted');
    addOperationLogFromCurrentState('Deleted selected pages');
  }, [addOperationLogFromCurrentState, deleteSelected, selectedIds.size, showUndoToast]);

  const handleReorderPages = useCallback(
    (activeId: string, overId: string): void => {
      reorderPages(activeId, overId);
      addOperationLogFromCurrentState('Reordered pages');
    },
    [addOperationLogFromCurrentState, reorderPages],
  );

  const handleRotateAll = useCallback((): void => {
    rotateAll();
    addOperationLogFromCurrentState('Rotated all pages');
  }, [addOperationLogFromCurrentState, rotateAll]);

  const handleUndo = useCallback((): void => {
    undo();
    addOperationLogFromCurrentState('Undo');
  }, [addOperationLogFromCurrentState, undo]);

  const handleRedo = useCallback((): void => {
    redo();
    addOperationLogFromCurrentState('Redo');
  }, [addOperationLogFromCurrentState, redo]);

  const handleSortOriginal = useCallback((): void => {
    const sorted = sortPagesByOriginalOrder(pages);
    restorePagesSnapshot(sorted);
    addOperationLogFromCurrentState('Sorted pages by original order');
  }, [addOperationLogFromCurrentState, pages, restorePagesSnapshot]);

  const handleRemoveDuplicates = useCallback((): void => {
    const deduped = dedupePagesBySource(pages);
    restorePagesSnapshot(deduped);
    addOperationLogFromCurrentState('Removed duplicate pages');
  }, [addOperationLogFromCurrentState, pages, restorePagesSnapshot]);

  const handleRestoreOperationSnapshot = useCallback(
    (entryId: string): void => {
      const target = operationLog.find((entry) => entry.id === entryId);
      if (!target?.snapshotPages || target.snapshotPages.length === 0) {
        return;
      }

      restorePagesSnapshot(target.snapshotPages);
      addOperationLogFromCurrentState(`Restored timeline: ${target.label}`);
    },
    [addOperationLogFromCurrentState, operationLog, restorePagesSnapshot],
  );

  useKeyboardShortcuts({
    onDeleteSelected: handleDeleteSelected,
    onSelectAll: selectAll,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDownload: () => {
      setIsExportPreviewOpen(true);
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
        addOperationLogFromCurrentState(`Selected ${ids.length} page(s) via range`);
        setRangeDialogError(null);
        setIsRangeDialogOpen(false);
      } catch (rangeError) {
        const message = rangeError instanceof Error ? rangeError.message : 'Invalid page range.';
        setRangeDialogError(message);
      }
    },
    [addOperationLogFromCurrentState, pages, setSelectedPageIds],
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

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {error && (
        <div className="fixed left-1/2 top-3 z-50 -translate-x-1/2 rounded bg-red-600 px-3 py-2 text-sm text-white shadow-lg">
          {error}
        </div>
      )}

      {pages.length === 0 ? (
        <div className="min-h-screen bg-slate-100 p-6 dark:bg-slate-950">
          <div className="mx-auto mb-4 max-w-6xl">
            {restorableSession && (
              <div className="mb-3 rounded border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                <p>Restore previous session from {new Date(restorableSession.savedAt).toLocaleString()}?</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={restorePreviousSession}
                    className="rounded bg-blue-600 px-2.5 py-1 text-white hover:bg-blue-700"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={dismissPreviousSession}
                    className="rounded border border-blue-300 px-2.5 py-1 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900/50"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {sessionHistory.length > 0 && (
              <div className="mb-3 rounded border border-slate-200 bg-white p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                <p className="font-semibold">Recent snapshots</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sessionHistory.map((snapshot) => (
                    <button
                      key={snapshot.savedAt}
                      type="button"
                      onClick={() => {
                        restoreHistorySnapshot(snapshot);
                      }}
                      className="rounded border border-slate-300 px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      {new Date(snapshot.savedAt).toLocaleTimeString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4 flex justify-end">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-lg border border-cyan-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm hover:bg-cyan-50 dark:border-cyan-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                title="Switch between light and dark themes"
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
          <DropZone
            onFilesSelected={(files) => {
              void loadFiles(files);
            }}
            disabled={isLoading}
            latestChanges={LATEST_CHANGELOG_ITEMS}
            onOpenOnboarding={() => {
              setIsOnboardingOpen(true);
            }}
          />
        </div>
      ) : (
        <AppShell
          sourceFiles={sourceFiles}
          pages={pages}
          selectedIds={selectedIds}
          activePageId={activePageId}
          zoom={zoom}
          displayZoom={effectiveZoom}
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
            setIsExportPreviewOpen(true);
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
            addOperationLogFromCurrentState(`Rotated ${selectedIds.size} selected page(s)`);
          }}
          onClearSelection={() => {
            clearSelection();
          }}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSortOriginal={handleSortOriginal}
          onRemoveDuplicates={handleRemoveDuplicates}
          onExtractOdd={() => {
            void handleExtractOdd();
          }}
          onExtractEven={() => {
            void handleExtractEven();
          }}
          onOpenExportPreview={() => {
            setIsExportPreviewOpen(true);
          }}
          onOpenKeyboardHelp={() => {
            setIsKeyboardHelpOpen(true);
          }}
          onOpenPrivacyPanel={() => {
            setIsPrivacyPanelOpen(true);
          }}
          onRestoreSnapshot={handleRestoreOperationSnapshot}
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

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          setIsOnboardingOpen(false);
        }}
        onDisableFuture={() => {
          window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
          setIsOnboardingOpen(false);
        }}
      />

      <ExportPreviewDialog
        isOpen={isExportPreviewOpen}
        totalPages={pages.length}
        selectedPages={selectedIds.size}
        profile={exportProfile}
        progress={exportProgress}
        isExporting={isExporting}
        onProfileChange={setExportProfile}
        onClose={() => {
          if (!isExporting) {
            setIsExportPreviewOpen(false);
          }
        }}
        onConfirm={() => {
          void handleDownload().then((didExport) => {
            if (didExport) {
              setIsExportPreviewOpen(false);
            }
          });
        }}
      />

      <KeyboardHelpDialog
        isOpen={isKeyboardHelpOpen}
        onClose={() => {
          setIsKeyboardHelpOpen(false);
        }}
      />

      <PrivacyPanelDialog
        isOpen={isPrivacyPanelOpen}
        sessionPersistenceMode={sessionPersistenceMode}
        onSessionPersistenceModeChange={setSessionPersistenceMode}
        onClose={() => {
          setIsPrivacyPanelOpen(false);
        }}
      />
    </>
  );
}
