import { useEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { renderPageToDataUrl } from '@/utils/canvas';
import type { PageInfo } from '@/types/pdf';

interface UsePdfRendererResult {
  thumbnails: Record<string, string>;
  isRendering: boolean;
}

export function usePdfRenderer(
  pages: PageInfo[],
  documents: Map<number, PDFDocumentProxy>,
  pageIdsToRender: Set<string>,
): UsePdfRendererResult {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});
  const [isRendering, setIsRendering] = useState(false);
  const thumbnailsRef = useRef<Record<string, string>>({});
  const inFlightRef = useRef<Set<string>>(new Set());
  const renderedSignatureRef = useRef<Record<string, string>>({});

  const renderablePages = useMemo(
    () => pages.filter((page) => documents.has(page.sourceFileIndex)),
    [documents, pages],
  );

  const pageSignatures = useMemo(
    () =>
      Object.fromEntries(
        pages.map((page) => [page.id, `${page.sourceFileIndex}:${page.sourcePageIndex}:${page.rotation}`]),
      ) as Record<string, string>,
    [pages],
  );

  const renderableIds = useMemo(() => {
    if (pageIdsToRender.size === 0) {
      return new Set(renderablePages.map((page) => page.id));
    }

    return pageIdsToRender;
  }, [pageIdsToRender, renderablePages]);

  useEffect(() => {
    let cancelled = false;

    const renderThumbnails = async (): Promise<void> => {
      if (renderablePages.length === 0) {
        setThumbnails({});
        thumbnailsRef.current = {};
        setIsRendering(false);
        return;
      }

      const missingPages = renderablePages.filter(
        (page) =>
          renderableIds.has(page.id) &&
          (!thumbnailsRef.current[page.id] || renderedSignatureRef.current[page.id] !== pageSignatures[page.id]) &&
          !inFlightRef.current.has(page.id),
      );
      if (missingPages.length === 0) {
        setIsRendering(false);
        return;
      }

      setIsRendering(true);

      const renderedEntries: Array<readonly [string, string]> = [];

      for (const page of missingPages) {
        if (cancelled) {
          break;
        }

        inFlightRef.current.add(page.id);

        const document = documents.get(page.sourceFileIndex);
        if (!document) {
          inFlightRef.current.delete(page.id);
          continue;
        }

        try {
          const dataUrl = await renderPageToDataUrl(document, page.sourcePageIndex, 0.3, page.rotation);
          renderedEntries.push([page.id, dataUrl] as const);
        } catch {
          // Ignore single-page render failures and continue rendering the rest.
        } finally {
          inFlightRef.current.delete(page.id);
        }
      }

      if (cancelled) {
        return;
      }

      setThumbnails((previous) => {
        const next = { ...previous };
        renderedEntries.forEach(([id, dataUrl]) => {
          next[id] = dataUrl;
          renderedSignatureRef.current[id] = pageSignatures[id];
        });
        thumbnailsRef.current = next;
        return next;
      });

      setIsRendering(false);
    };

    void renderThumbnails();

    return () => {
      cancelled = true;
    };
  }, [documents, renderableIds, renderablePages]);

  useEffect(() => {
    setThumbnails((previous) => {
      const next: Record<string, string> = {};
      Object.entries(previous).forEach(([id, url]) => {
        if (pageSignatures[id] && renderedSignatureRef.current[id] === pageSignatures[id]) {
          next[id] = url;
        }
      });

      thumbnailsRef.current = next;
      renderedSignatureRef.current = Object.fromEntries(
        Object.entries(renderedSignatureRef.current).filter(([id, signature]) => pageSignatures[id] === signature),
      );

      return next;
    });

    inFlightRef.current.clear();
  }, [pageSignatures]);

  return { thumbnails, isRendering };
}
