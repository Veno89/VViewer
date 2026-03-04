import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PageInfo, ZoomMode } from '@/types/pdf';

interface PagePreviewProps {
  activePage: PageInfo | null;
  documents: Map<number, PDFDocumentProxy>;
  zoom: number;
  zoomMode: ZoomMode;
  onEffectiveZoomChange?: (zoom: number) => void;
}

export function PagePreview({ activePage, documents, zoom, zoomMode, onEffectiveZoomChange }: PagePreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<{ promise: Promise<unknown>; cancel: () => void } | null>(null);
  const renderRunRef = useRef(0);
  const lastReportedZoomRef = useRef<number | null>(null);
  const [isRendering, setIsRendering] = useState(false);
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
      // Always cancel / await the previous render before touching the canvas.
      await cancelCurrentRender();
      if (stale()) return;

      setIsRendering(true);
      setError(null);

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
        // Silently ignore ANY error from a superseded / cancelled render.
        if (stale()) return;
        const msg = (err as { name?: string })?.name;
        if (msg === 'RenderingCancelledException' || msg === 'RenderingCancelled') return;
        setError(err instanceof Error ? err.message : 'Failed to render page.');
      } finally {
        if (!stale()) setIsRendering(false);
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
      {isRendering && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded bg-gray-900 px-3 py-1 text-xs text-white">
          Rendering page...
        </div>
      )}
      {error && (
        <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded bg-red-600 px-3 py-1 text-xs text-white">
          {error}
        </div>
      )}
      <canvas ref={canvasRef} className="rounded-md bg-white shadow-lg" />
    </div>
  );
}
