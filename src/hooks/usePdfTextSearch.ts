import { useEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PageInfo } from '@/types/pdf';

export interface SearchMatch {
  pageId: string;
  pageNumber: number;
  snippet: string;
}

interface UsePdfTextSearchResult {
  matches: SearchMatch[];
  isIndexing: boolean;
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
  const textCacheRef = useRef<Map<string, string>>(new Map());

  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  useEffect(() => {
    let cancelled = false;

    const indexAndSearch = async (): Promise<void> => {
      if (normalizedQuery.length < 2 || pages.length === 0 || documents.size === 0) {
        setMatches([]);
        setIsIndexing(false);
        return;
      }

      setIsIndexing(true);
      const nextMatches: SearchMatch[] = [];

      for (let i = 0; i < pages.length; i += 1) {
        if (cancelled) {
          return;
        }

        const page = pages[i];
        const cacheKey = `${page.sourceFileIndex}:${page.sourcePageIndex}`;
        let pageText = textCacheRef.current.get(cacheKey);

        if (!pageText) {
          const document = documents.get(page.sourceFileIndex);
          if (!document) {
            continue;
          }

          try {
            const pdfPage = await document.getPage(page.sourcePageIndex + 1);
            const textContent = await pdfPage.getTextContent();
            pageText = textContent.items
              .map((item) => {
                if ('str' in item && typeof item.str === 'string') {
                  return item.str;
                }

                return '';
              })
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
            textCacheRef.current.set(cacheKey, pageText);
          } catch {
            pageText = '';
          }
        }

        if (pageText.toLowerCase().includes(normalizedQuery)) {
          nextMatches.push({
            pageId: page.id,
            pageNumber: i + 1,
            snippet: toSnippet(pageText, normalizedQuery),
          });
        }
      }

      if (!cancelled) {
        setMatches(nextMatches);
        setIsIndexing(false);
      }
    };

    void indexAndSearch();

    return () => {
      cancelled = true;
    };
  }, [documents, normalizedQuery, pages]);

  return { matches, isIndexing };
}
