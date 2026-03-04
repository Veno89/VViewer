interface SearchStatusNoteInput {
  isLargeDocumentMode: boolean;
  pageCount: number;
  query: string;
  isScanLimited: boolean;
  scannedPages: number;
}

export function resolveSearchScanPageCount(totalPages: number, maxPagesToScan: number): number {
  if (totalPages <= 0) {
    return 0;
  }

  const boundedMax = Number.isFinite(maxPagesToScan)
    ? Math.max(1, Math.floor(maxPagesToScan))
    : totalPages;

  return Math.min(totalPages, boundedMax);
}

export function buildSearchStatusNote(input: SearchStatusNoteInput): string {
  const { isLargeDocumentMode, pageCount, query, isScanLimited, scannedPages } = input;

  if (!isLargeDocumentMode) {
    return '';
  }

  if (query.trim().length < 2) {
    return `Large document mode active (${pageCount} pages): thumbnail rendering is focused around the active page for responsiveness.`;
  }

  if (isScanLimited) {
    return `Large document mode: search scanned ${scannedPages} of ${pageCount} pages and preview highlights are reduced.`;
  }

  return `Large document mode active (${pageCount} pages): preview highlights are reduced to keep navigation responsive.`;
}