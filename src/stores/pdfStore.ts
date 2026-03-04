import { arrayMove } from '@dnd-kit/sortable';
import { create } from 'zustand';
import { getPdfPageCount } from '@/services/pdfLoader';
import type { PageInfo, PageRotation, PersistedPdfSession, PdfSourceFile, PdfState } from '@/types/pdf';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;

function clampZoom(zoom: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
}

function rotateClockwise(rotation: PageRotation): PageRotation {
  return ((rotation + 90) % 360) as PageRotation;
}

function updateHistory(history: PageInfo[][], pages: PageInfo[]): PageInfo[][] {
  return [...history, pages.map((page) => ({ ...page }))];
}

function getActivePageAfterDelete(pages: PageInfo[], activePageId: string | null): string | null {
  if (pages.length === 0) {
    return null;
  }

  if (!activePageId) {
    return pages[0].id;
  }

  const activeStillExists = pages.some((page) => page.id === activePageId);
  return activeStillExists ? activePageId : pages[0].id;
}

function bytesToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export const usePdfStore = create<PdfState>((set, get) => ({
  sourceFiles: [],
  pages: [],
  selectedIds: new Set<string>(),
  activePageId: null,
  lastSelectedPageId: null,
  zoom: 1,
  history: [],
  future: [],
  isLoading: false,
  error: null,

  async loadPdf(bytes, fileName = 'Document.pdf') {
    set({ isLoading: true, error: null });

    try {
      const pageCount = await getPdfPageCount(bytes);

      set((state) => {
        const sourceFileIndex = state.sourceFiles.length;
        const sourceFile: PdfSourceFile = {
          index: sourceFileIndex,
          name: fileName,
          bytes,
          pageCount,
        };

        const newPages: PageInfo[] = Array.from({ length: pageCount }, (_, sourcePageIndex) => ({
          id: `${sourceFileIndex}-${sourcePageIndex}`,
          sourceFileIndex,
          sourcePageIndex,
          rotation: 0,
        }));

        const nextPages = [...state.pages, ...newPages];

        return {
          sourceFiles: [...state.sourceFiles, sourceFile],
          pages: nextPages,
          history: updateHistory(state.history, state.pages),
          future: [],
          activePageId: state.activePageId ?? newPages[0]?.id ?? null,
          selectedIds: new Set<string>(),
          lastSelectedPageId: null,
          isLoading: false,
          error: null,
        };
      });
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load PDF file.';
      set({ isLoading: false, error: message });
    }
  },

  reorderPages(activeId, overId) {
    if (activeId === overId) {
      return;
    }

    set((state) => {
      const oldIndex = state.pages.findIndex((page) => page.id === activeId);
      const newIndex = state.pages.findIndex((page) => page.id === overId);

      if (oldIndex < 0 || newIndex < 0) {
        return state;
      }

      return {
        pages: arrayMove(state.pages, oldIndex, newIndex),
        history: updateHistory(state.history, state.pages),
        future: [],
      };
    });
  },

  deletePage(id) {
    set((state) => {
      const nextPages = state.pages.filter((page) => page.id !== id);
      if (nextPages.length === state.pages.length) {
        return state;
      }

      const nextSelection = new Set(state.selectedIds);
      nextSelection.delete(id);

      return {
        pages: nextPages,
        history: updateHistory(state.history, state.pages),
        future: [],
        selectedIds: nextSelection,
        lastSelectedPageId: state.lastSelectedPageId === id ? null : state.lastSelectedPageId,
        activePageId: getActivePageAfterDelete(nextPages, state.activePageId),
      };
    });
  },

  deleteSelected() {
    set((state) => {
      if (state.selectedIds.size === 0) {
        return state;
      }

      const nextPages = state.pages.filter((page) => !state.selectedIds.has(page.id));

      return {
        pages: nextPages,
        history: updateHistory(state.history, state.pages),
        future: [],
        selectedIds: new Set<string>(),
        lastSelectedPageId: null,
        activePageId: getActivePageAfterDelete(nextPages, state.activePageId),
      };
    });
  },

  rotatePage(id) {
    set((state) => {
      let hasChanges = false;
      const nextPages = state.pages.map((page) => {
        if (page.id !== id) {
          return page;
        }

        hasChanges = true;
        return { ...page, rotation: rotateClockwise(page.rotation) };
      });

      if (!hasChanges) {
        return state;
      }

      return {
        pages: nextPages,
        history: updateHistory(state.history, state.pages),
        future: [],
      };
    });
  },

  rotateAll() {
    set((state) => {
      if (state.pages.length === 0) {
        return state;
      }

      return {
        pages: state.pages.map((page) => ({ ...page, rotation: rotateClockwise(page.rotation) })),
        history: updateHistory(state.history, state.pages),
        future: [],
      };
    });
  },

  selectPage(id, multi, range) {
    set((state) => {
      const targetIndex = state.pages.findIndex((page) => page.id === id);
      if (targetIndex < 0) {
        return state;
      }

      if (range && state.lastSelectedPageId) {
        const anchorIndex = state.pages.findIndex((page) => page.id === state.lastSelectedPageId);
        if (anchorIndex >= 0) {
          const start = Math.min(anchorIndex, targetIndex);
          const end = Math.max(anchorIndex, targetIndex);
          const selectedRange = new Set(state.selectedIds);

          for (let index = start; index <= end; index += 1) {
            selectedRange.add(state.pages[index].id);
          }

          return {
            selectedIds: selectedRange,
            activePageId: id,
          };
        }
      }

      if (multi) {
        const nextSelection = new Set(state.selectedIds);
        if (nextSelection.has(id)) {
          nextSelection.delete(id);
        } else {
          nextSelection.add(id);
        }

        return {
          selectedIds: nextSelection,
          activePageId: id,
          lastSelectedPageId: id,
        };
      }

      return {
        selectedIds: new Set<string>([id]),
        activePageId: id,
        lastSelectedPageId: id,
      };
    });
  },

  selectAll() {
    set((state) => {
      if (state.pages.length === 0) {
        return state;
      }

      return {
        selectedIds: new Set(state.pages.map((page) => page.id)),
        activePageId: state.activePageId ?? state.pages[0].id,
        lastSelectedPageId: state.pages[state.pages.length - 1].id,
      };
    });
  },

  setSelectedPageIds(ids) {
    set((state) => {
      if (ids.length === 0) {
        return {
          selectedIds: new Set<string>(),
          lastSelectedPageId: null,
        };
      }

      const existingIds = new Set(state.pages.map((page) => page.id));
      const filteredIds = ids.filter((id) => existingIds.has(id));

      if (filteredIds.length === 0) {
        return {
          selectedIds: new Set<string>(),
          lastSelectedPageId: null,
        };
      }

      const firstId = filteredIds[0];
      const lastId = filteredIds[filteredIds.length - 1];

      return {
        selectedIds: new Set(filteredIds),
        activePageId: firstId,
        lastSelectedPageId: lastId,
      };
    });
  },

  clearSelection() {
    set({ selectedIds: new Set<string>(), lastSelectedPageId: null });
  },

  setActivePage(id) {
    const pageExists = get().pages.some((page) => page.id === id);
    if (!pageExists) {
      return;
    }

    set({ activePageId: id });
  },

  setZoom(zoom) {
    set({ zoom: clampZoom(zoom) });
  },

  clearDocument() {
    set({
      sourceFiles: [],
      pages: [],
      selectedIds: new Set<string>(),
      activePageId: null,
      lastSelectedPageId: null,
      history: [],
      future: [],
      zoom: 1,
      isLoading: false,
      error: null,
    });
  },

  restorePagesSnapshot(snapshotPages) {
    set((state) => {
      if (snapshotPages.length === 0) {
        return state;
      }

      const sourceFileIndexes = new Set(state.sourceFiles.map((file) => file.index));
      const sanitizedPages = snapshotPages.filter((page) => sourceFileIndexes.has(page.sourceFileIndex));

      if (sanitizedPages.length === 0) {
        return state;
      }

      return {
        pages: sanitizedPages.map((page) => ({ ...page })),
        history: updateHistory(state.history, state.pages),
        future: [],
        selectedIds: new Set<string>(),
        lastSelectedPageId: null,
        activePageId: getActivePageAfterDelete(sanitizedPages, state.activePageId),
      };
    });
  },

  hydrateSession(session) {
    const sourceFiles: PdfSourceFile[] = session.sourceFiles.map((sourceFile) => ({
      index: sourceFile.index,
      name: sourceFile.name,
      bytes: base64ToBytes(sourceFile.bytesBase64),
      pageCount: sourceFile.pageCount,
    }));

    set({
      sourceFiles,
      pages: session.pages,
      selectedIds: new Set(session.selectedIds),
      activePageId: session.activePageId,
      lastSelectedPageId: session.lastSelectedPageId,
      zoom: clampZoom(session.zoom),
      history: [],
      future: [],
      isLoading: false,
      error: null,
    });
  },

  getSessionSnapshot() {
    const state = get();

    if (state.sourceFiles.length === 0 || state.pages.length === 0) {
      return null;
    }

    const snapshot: PersistedPdfSession = {
      sourceFiles: state.sourceFiles.map((sourceFile) => ({
        index: sourceFile.index,
        name: sourceFile.name,
        bytesBase64: bytesToBase64(sourceFile.bytes),
        pageCount: sourceFile.pageCount,
      })),
      pages: state.pages.map((page) => ({ ...page })),
      selectedIds: [...state.selectedIds],
      activePageId: state.activePageId,
      lastSelectedPageId: state.lastSelectedPageId,
      zoom: state.zoom,
      savedAt: new Date().toISOString(),
    };

    return snapshot;
  },

  undo() {
    set((state) => {
      if (state.history.length === 0) {
        return state;
      }

      const previousPages = state.history[state.history.length - 1];
      const nextHistory = state.history.slice(0, -1);

      return {
        pages: previousPages.map((page) => ({ ...page })),
        history: nextHistory,
        future: [...state.future, state.pages.map((page) => ({ ...page }))],
        activePageId: getActivePageAfterDelete(previousPages, state.activePageId),
      };
    });
  },

  redo() {
    set((state) => {
      if (state.future.length === 0) {
        return state;
      }

      const nextPages = state.future[state.future.length - 1];
      const nextFuture = state.future.slice(0, -1);

      return {
        pages: nextPages.map((page) => ({ ...page })),
        future: nextFuture,
        history: updateHistory(state.history, state.pages),
        activePageId: getActivePageAfterDelete(nextPages, state.activePageId),
      };
    });
  },

  setError(message) {
    set({ error: message });
  },
}));
