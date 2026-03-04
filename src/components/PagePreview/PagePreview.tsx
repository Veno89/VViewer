import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { SearchHighlightRect } from '@/hooks/usePdfTextSearch';
import type { PageInfo, ZoomMode } from '@/types/pdf';

interface PagePreviewProps {
  activePage: PageInfo | null;
  documents: Map<number, PDFDocumentProxy>;
  zoom: number;
  zoomMode: ZoomMode;
  searchHighlights?: SearchHighlightRect[];
  onEffectiveZoomChange?: (zoom: number) => void;
}

export function PagePreview({ activePage, documents, zoom, zoomMode, searchHighlights = [], onEffectiveZoomChange }: PagePreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<{ promise: Promise<unknown>; cancel: () => void } | null>(null);
  const renderRunRef = useRef(0);
  const lastReportedZoomRef = useRef<number | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showRenderingHint, setShowRenderingHint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 900, height: 700 });
  const manualZoomDependency = zoomMode === 'manual' ? zoom : 1;

  const cancelCurrentRender = useCallback(async () => {
    const task = renderTaskRef.current;
    if (!task) return;
    task.cancel();
    try { await task.promise; } catch { /* cancelled */ }
    renderTaskRef.current = null;
  }, []);

  const activeDocument = useMemo(() => {
    if (!activePage) {
      return null;
    }

    return documents.get(activePage.sourceFileIndex) ?? null;
  }, [activePage, documents]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setContainerSize({
        width: Math.max(Math.floor(entry.contentRect.width), 200),
        height: Math.max(Math.floor(entry.contentRect.height), 200),
      });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const renderRun = ++renderRunRef.current;
    const stale = () => renderRunRef.current !== renderRun;

    if (!canvasRef.current || !activePage || !activeDocument) {
      void cancelCurrentRender();
      return;
    }

    const run = async () => {
      // Cancel the previous render and yield a microtask so pdf.js fully releases the canvas.
      await cancelCurrentRender();
      await new Promise<void>((r) => setTimeout(r, 0));
      if (stale()) return;

      setIsRendering(true);
      setError(null);
      // Only show the indicator if the render takes more than 300 ms.
      if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
      renderTimerRef.current = setTimeout(() => { setShowRenderingHint(true); }, 300);

      try {
        let scale = manualZoomDependency;

        if (zoomMode !== 'manual') {
          const sizePage = await activeDocument.getPage(activePage.sourcePageIndex + 1);
          if (stale()) return;

          const baseViewport = sizePage.getViewport({ scale: 1, rotation: activePage.rotation });
          const cw = Math.max(containerSize.width - 48, 200);
          const ch = Math.max(containerSize.height - 48, 200);

          scale = zoomMode === 'fit-width'
            ? cw / baseViewport.width
            : Math.min(cw / baseViewport.width, ch / baseViewport.height);
        }

        const clampedScale = Math.round(Math.max(0.5, Math.min(2, scale)) * 1000) / 1000;
        if (lastReportedZoomRef.current !== clampedScale) {
          lastReportedZoomRef.current = clampedScale;
          onEffectiveZoomChange?.(clampedScale);
        }

        const page = await activeDocument.getPage(activePage.sourcePageIndex + 1);
        if (stale() || !canvasRef.current) return;

        const viewport = page.getViewport({ scale: clampedScale, rotation: activePage.rotation });
        const canvas = canvasRef.current;

        // Resetting width/height clears the canvas and any internal pdf.js state tied to it.
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context is not available.');

        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task as unknown as { promise: Promise<unknown>; cancel: () => void };

        await task.promise;
        renderTaskRef.current = null;
      } catch (err: unknown) {
        if (stale()) return;
        // Silently swallow any cancellation or canvas-conflict error from pdf.js.
        const name = (err as { name?: string })?.name ?? '';
        const message = (err as { message?: string })?.message ?? '';
        if (/cancel|rendering/i.test(name) || /canvas|render/i.test(message)) return;
        setError(err instanceof Error ? err.message : 'Failed to render page.');
      } finally {
        if (renderTimerRef.current) { clearTimeout(renderTimerRef.current); renderTimerRef.current = null; }
        if (!stale()) { setIsRendering(false); setShowRenderingHint(false); }
      }
    };

    void run();

    return () => {
      // Increment run counter so the in-flight render bails via stale().
      renderRunRef.current++;
      renderTaskRef.current?.cancel();
    };
  }, [activeDocument, activePage, cancelCurrentRender, containerSize.height, containerSize.width, manualZoomDependency, onEffectiveZoomChange, zoomMode]);

  if (!activePage) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">Open a PDF to start previewing pages.</div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex h-full items-start justify-center overflow-auto p-6">
      {isRendering && showRenderingHint && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded bg-gray-900/70 px-3 py-1 text-xs text-white">
          Rendering page...
        </div>
      )}
      {error && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded bg-red-600 px-3 py-1 text-xs text-white">
          {error}
        </div>
      )}
      <div className="relative inline-block">
        <canvas ref={canvasRef} className="rounded-md bg-white shadow-lg" />
        {searchHighlights.length > 0 && (
          <div className="pointer-events-none absolute inset-0">
            {searchHighlights.map((rect, index) => (
              <span
                key={`${rect.left}-${rect.top}-${index}`}
                className="absolute rounded-sm border border-amber-300 bg-amber-300/35 dark:border-amber-200 dark:bg-amber-200/30"
                style={{
                  left: `${Math.max(0, Math.min(1, rect.left)) * 100}%`,
                  top: `${Math.max(0, Math.min(1, rect.top)) * 100}%`,
                  width: `${Math.max(0, Math.min(1, rect.width)) * 100}%`,
                  height: `${Math.max(0, Math.min(1, rect.height)) * 100}%`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
