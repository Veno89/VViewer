import { useEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PageInfo } from '@/types/pdf';

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
}

interface SearchableTextItem {
  text: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

interface CachedPageText {
  mergedText: string;
  items: SearchableTextItem[];
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
): UsePdfTextSearchResult {
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [isIndexing, setIsIndexing] = useState(false);
  const [highlightsByPage, setHighlightsByPage] = useState<Record<string, SearchHighlightRect[]>>({});
  const textCacheRef = useRef<Map<string, CachedPageText>>(new Map());

  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  useEffect(() => {
    let cancelled = false;

    const indexAndSearch = async (): Promise<void> => {
      if (normalizedQuery.length < 2 || pages.length === 0 || documents.size === 0) {
        setMatches([]);
        setHighlightsByPage({});
        setIsIndexing(false);
        return;
      }

      setIsIndexing(true);
      const nextMatches: SearchMatch[] = [];
      const nextHighlightsByPage: Record<string, SearchHighlightRect[]> = {};

      for (let i = 0; i < pages.length; i += 1) {
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
            const searchableItems: SearchableTextItem[] = textContent.items
              .map((item) => {
                if (!('str' in item) || typeof item.str !== 'string' || !('transform' in item)) {
                  return null;
                }

                const transform = Array.isArray(item.transform) ? item.transform : null;
                if (!transform || transform.length < 6 || !('width' in item)) {
                  return null;
                }

                const rawHeight = Math.max(Math.abs(transform[3]), 8);
                const rawWidth = typeof item.width === 'number' ? Math.max(item.width, 1) : 1;
                const rawLeft = transform[4];
                const rawTop = viewport.height - transform[5] - rawHeight;

                const clampedLeft = Math.max(0, Math.min(viewport.width, rawLeft));
                const clampedTop = Math.max(0, Math.min(viewport.height, rawTop));
                const clampedWidth = Math.max(0, Math.min(viewport.width - clampedLeft, rawWidth));
                const clampedHeight = Math.max(0, Math.min(viewport.height - clampedTop, rawHeight));

                return {
                  text: item.str,
                  left: clampedLeft / viewport.width,
                  top: clampedTop / viewport.height,
                  width: clampedWidth / viewport.width,
                  height: clampedHeight / viewport.height,
                };
              })
              .filter((item): item is SearchableTextItem => Boolean(item));

            const mergedText = searchableItems
              .map((item) => item.text)
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();

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

        const pageHighlights = pageText.items.filter((item) => item.text.toLowerCase().includes(normalizedQuery));

        if (pageHighlights.length > 0 || pageText.mergedText.toLowerCase().includes(normalizedQuery)) {
          if (pageHighlights.length > 0) {
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
  }, [documents, normalizedQuery, pages]);

  return { matches, isIndexing, highlightsByPage };
}
