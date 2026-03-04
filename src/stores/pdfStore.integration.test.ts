import { beforeEach, describe, expect, it } from 'vitest';
import { usePdfStore } from './pdfStore';
import type { PageInfo, PdfState } from '../types/pdf';

function makePages(count: number): PageInfo[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `0-${index}`,
    sourceFileIndex: 0,
    sourcePageIndex: index,
    rotation: 0,
  }));
}

function resetStoreState() {
  const state = usePdfStore.getState();
  usePdfStore.setState({
    ...state,
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
  } as PdfState, true);
}

describe('pdfStore integration workflows', () => {
  beforeEach(() => {
    resetStoreState();
  });

  it('clamps zoom within limits', () => {
    const state = usePdfStore.getState();

    state.setZoom(10);
    expect(usePdfStore.getState().zoom).toBe(2);

    state.setZoom(0.1);
    expect(usePdfStore.getState().zoom).toBe(0.5);

    state.setZoom(1.25);
    expect(usePdfStore.getState().zoom).toBe(1.25);
  });

  it('supports reorder with undo/redo', () => {
    const pages = makePages(3);
    usePdfStore.setState((state) => ({ ...state, pages, activePageId: pages[0]?.id ?? null }));

    const state = usePdfStore.getState();
    state.reorderPages('0-0', '0-2');

    expect(usePdfStore.getState().pages.map((page) => page.id)).toEqual(['0-1', '0-2', '0-0']);

    state.undo();
    expect(usePdfStore.getState().pages.map((page) => page.id)).toEqual(['0-0', '0-1', '0-2']);

    state.redo();
    expect(usePdfStore.getState().pages.map((page) => page.id)).toEqual(['0-1', '0-2', '0-0']);
  });

  it('supports rotate and delete workflows with undo/redo', () => {
    const pages = makePages(2);
    usePdfStore.setState((state) => ({ ...state, pages, activePageId: '0-0', selectedIds: new Set(['0-1']) }));

    const state = usePdfStore.getState();

    state.rotatePage('0-0');
    expect(usePdfStore.getState().pages.find((page) => page.id === '0-0')?.rotation).toBe(90);

    state.deleteSelected();
    expect(usePdfStore.getState().pages.map((page) => page.id)).toEqual(['0-0']);

    state.undo();
    expect(usePdfStore.getState().pages.map((page) => page.id)).toEqual(['0-0', '0-1']);

    state.undo();
    expect(usePdfStore.getState().pages.find((page) => page.id === '0-0')?.rotation).toBe(0);

    state.redo();
    state.redo();
    expect(usePdfStore.getState().pages.map((page) => page.id)).toEqual(['0-0']);
    expect(usePdfStore.getState().pages.find((page) => page.id === '0-0')?.rotation).toBe(90);
  });
});
