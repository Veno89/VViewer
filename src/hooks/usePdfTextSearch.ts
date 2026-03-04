import { useEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PageInfo } from '@/types/pdf';
import { mergeNormalizedText, normalizeTextItems, type NormalizedTextRect } from '@/utils/pdfTextLayer';
import { resolveSearchScanPageCount } from '@/utils/searchReliability';

export interface SearchMatch {
  pageId: string;
  pageNumber: number;
  snippet: string;
  matchCount: number;
}

export interface SearchHighlightRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface UsePdfTextSearchResult {
  matches: SearchMatch[];
  isIndexing: boolean;
  highlightsByPage: Record<string, SearchHighlightRect[]>;
  isScanLimited: boolean;
  scannedPages: number;
}

interface UsePdfTextSearchOptions {
  enabled?: boolean;
  maxPagesToScan?: number;
  includeHighlights?: boolean;
}

interface CachedPageText {
  mergedText: string;
  items: NormalizedTextRect[];
}

function toSnippet(text: string, query: string): string {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index < 0) {
    return text.slice(0, 120);
  }

  const start = Math.max(0, index - 30);
  const end = Math.min(text.length, index + query.length + 50);
  return text.slice(start, end).trim();
}

export function usePdfTextSearch(
  query: string,
  pages: PageInfo[],
  documents: Map<number, PDFDocumentProxy>,
  options: UsePdfTextSearchOptions = {},
): UsePdfTextSearchResult {
  const { enabled = true, maxPagesToScan = Number.MAX_SAFE_INTEGER, includeHighlights = true } = options;
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [isIndexing, setIsIndexing] = useState(false);
  const [highlightsByPage, setHighlightsByPage] = useState<Record<string, SearchHighlightRect[]>>({});
  const [isScanLimited, setIsScanLimited] = useState(false);
  const [scannedPages, setScannedPages] = useState(0);
  const textCacheRef = useRef<Map<string, CachedPageText>>(new Map());

  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  useEffect(() => {
    let cancelled = false;

    const indexAndSearch = async (): Promise<void> => {
      if (!enabled || normalizedQuery.length < 2 || pages.length === 0 || documents.size === 0) {
        setMatches([]);
        setHighlightsByPage({});
        setIsScanLimited(false);
        setScannedPages(0);
        setIsIndexing(false);
        return;
      }

      setIsIndexing(true);
      const nextMatches: SearchMatch[] = [];
      const nextHighlightsByPage: Record<string, SearchHighlightRect[]> = {};
      const scanPageCount = resolveSearchScanPageCount(pages.length, maxPagesToScan);
      setIsScanLimited(scanPageCount < pages.length);
      setScannedPages(scanPageCount);

      for (let i = 0; i < scanPageCount; i += 1) {
        if (cancelled) {
          return;
        }

        const page = pages[i];
        const cacheKey = `${page.sourceFileIndex}:${page.sourcePageIndex}:${page.rotation}`;
        let pageText = textCacheRef.current.get(cacheKey);

        if (!pageText) {
          const document = documents.get(page.sourceFileIndex);
          if (!document) {
            continue;
          }

          try {
            const pdfPage = await document.getPage(page.sourcePageIndex + 1);
            const viewport = pdfPage.getViewport({ scale: 1, rotation: page.rotation });
            const textContent = await pdfPage.getTextContent();
            const searchableItems = normalizeTextItems(textContent.items, viewport.width, viewport.height);
            const mergedText = mergeNormalizedText(searchableItems);

            pageText = {
              mergedText,
              items: searchableItems,
            };

            textCacheRef.current.set(cacheKey, pageText);
          } catch {
            pageText = {
              mergedText: '',
              items: [],
            };
          }
        }

        const pageHighlights = includeHighlights
          ? pageText.items.filter((item) => item.text.toLowerCase().includes(normalizedQuery))
          : [];

        if (pageHighlights.length > 0 || pageText.mergedText.toLowerCase().includes(normalizedQuery)) {
          if (includeHighlights && pageHighlights.length > 0) {
            nextHighlightsByPage[page.id] = pageHighlights.map((item) => ({
              left: item.left,
              top: item.top,
              width: item.width,
              height: item.height,
            }));
          }

          nextMatches.push({
            pageId: page.id,
            pageNumber: i + 1,
            snippet: toSnippet(pageText.mergedText, normalizedQuery),
            matchCount: pageHighlights.length,
          });
        }
      }

      if (!cancelled) {
        setMatches(nextMatches);
        setHighlightsByPage(nextHighlightsByPage);
        setIsIndexing(false);
      }
    };

    void indexAndSearch();

    return () => {
      cancelled = true;
    };
  }, [documents, enabled, includeHighlights, maxPagesToScan, normalizedQuery, pages]);

  return { matches, isIndexing, highlightsByPage, isScanLimited, scannedPages };
}
