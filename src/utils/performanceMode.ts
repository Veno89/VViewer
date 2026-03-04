export interface PerformanceModeState {
  isLargeDocumentMode: boolean;
  pageCount: number;
  searchPageScanLimit: number;
  thumbnailRadius: number;
}

export const LARGE_DOCUMENT_PAGE_THRESHOLD = 180;
export const LARGE_DOCUMENT_SEARCH_SCAN_LIMIT = 120;
export const LARGE_DOCUMENT_THUMBNAIL_RADIUS = 20;

const DEFAULT_SEARCH_SCAN_LIMIT = Number.MAX_SAFE_INTEGER;
const DEFAULT_THUMBNAIL_RADIUS = Number.MAX_SAFE_INTEGER;

export function createPerformanceModeState(pageCount: number): PerformanceModeState {
  const isLargeDocumentMode = pageCount >= LARGE_DOCUMENT_PAGE_THRESHOLD;

  return {
    isLargeDocumentMode,
    pageCount,
    searchPageScanLimit: isLargeDocumentMode ? LARGE_DOCUMENT_SEARCH_SCAN_LIMIT : DEFAULT_SEARCH_SCAN_LIMIT,
    thumbnailRadius: isLargeDocumentMode ? LARGE_DOCUMENT_THUMBNAIL_RADIUS : DEFAULT_THUMBNAIL_RADIUS,
  };
}

export function createThumbnailRenderIds(
  pageIds: string[],
  activeIndex: number,
  selectedIds: Set<string>,
  radius: number,
): Set<string> {
  if (pageIds.length === 0) {
    return new Set<string>();
  }

  if (!Number.isFinite(radius) || radius >= pageIds.length) {
    return new Set(pageIds);
  }

  const safeActiveIndex = activeIndex >= 0 && activeIndex < pageIds.length ? activeIndex : 0;
  const start = Math.max(0, safeActiveIndex - radius);
  const end = Math.min(pageIds.length - 1, safeActiveIndex + radius);
  const renderIds = new Set(pageIds.slice(start, end + 1));

  selectedIds.forEach((id) => {
    if (pageIds.includes(id)) {
      renderIds.add(id);
    }
  });

  return renderIds;
}