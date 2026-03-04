import { describe, expect, it } from 'vitest';
import {
  LARGE_DOCUMENT_PAGE_THRESHOLD,
  createPerformanceModeState,
  createThumbnailRenderIds,
} from './performanceMode';

describe('performanceMode', () => {
  it('enables large-document mode when page threshold is reached', () => {
    const regular = createPerformanceModeState(LARGE_DOCUMENT_PAGE_THRESHOLD - 1);
    const large = createPerformanceModeState(LARGE_DOCUMENT_PAGE_THRESHOLD);

    expect(regular.isLargeDocumentMode).toBe(false);
    expect(large.isLargeDocumentMode).toBe(true);
    expect(large.searchPageScanLimit).toBeLessThan(Number.MAX_SAFE_INTEGER);
  });

  it('builds thumbnail render ids around active page and selected pages', () => {
    const pageIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
    const renderIds = createThumbnailRenderIds(pageIds, 2, new Set(['p6']), 1);

    expect(Array.from(renderIds).sort()).toEqual(['p2', 'p3', 'p4', 'p6']);
  });

  it('falls back to all pages when radius is unbounded', () => {
    const pageIds = ['a', 'b', 'c'];
    const renderIds = createThumbnailRenderIds(pageIds, 1, new Set(), Number.MAX_SAFE_INTEGER);
    expect(Array.from(renderIds).sort()).toEqual(pageIds);
  });
});