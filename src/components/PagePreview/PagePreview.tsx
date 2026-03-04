import { useEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PageInfo, ZoomMode } from '@/types/pdf';

interface PdfRenderTask {
  promise: Promise<unknown>;
  cancel: () => void;
}

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
  const activeRenderTaskRef = useRef<PdfRenderTask | null>(null);
  const renderRunRef = useRef(0);
  const lastReportedZoomRef = useRef<number | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 900, height: 700 });
  const manualZoomDependency = zoomMode === 'manual' ? zoom : 1;

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
    let unmounted = false;
    const renderRun = renderRunRef.current + 1;
    renderRunRef.current = renderRun;
    const manualZoom = manualZoomDependency;

    const renderActivePage = async (): Promise<void> => {
      if (!canvasRef.current || !activePage || !activeDocument) {
        activeRenderTaskRef.current?.cancel();
        activeRenderTaskRef.current = null;
        return;
      }

      const previousTask = activeRenderTaskRef.current;
      previousTask?.cancel();
      if (previousTask) {
        try {
          await previousTask.promise;
        } catch {
          // Expected when cancellation interrupts an in-flight render task.
        }
      }
      activeRenderTaskRef.current = null;

      setIsRendering(true);
      setError(null);

      try {
        let scale = manualZoom;

        if (zoomMode !== 'manual') {
          const page = await activeDocument.getPage(activePage.sourcePageIndex + 1);
          const baseViewport = page.getViewport({ scale: 1, rotation: activePage.rotation });
          const containerWidth = Math.max(containerSize.width - 48, 200);
          const containerHeight = Math.max(containerSize.height - 48, 200);

          if (zoomMode === 'fit-width') {
            scale = containerWidth / baseViewport.width;
          } else {
            scale = Math.min(containerWidth / baseViewport.width, containerHeight / baseViewport.height);
          }
        }

        const clampedScale = Math.round(Math.max(0.5, Math.min(2, scale)) * 1000) / 1000;
        if (lastReportedZoomRef.current !== clampedScale) {
          lastReportedZoomRef.current = clampedScale;
          onEffectiveZoomChange?.(clampedScale);
        }

        const page = await activeDocument.getPage(activePage.sourcePageIndex + 1);
        const viewport = page.getViewport({ scale: clampedScale, rotation: activePage.rotation });
        const context = canvasRef.current.getContext('2d');

        if (!context) {
          throw new Error('Canvas 2D context is not available.');
        }

        canvasRef.current.width = Math.ceil(viewport.width);
        canvasRef.current.height = Math.ceil(viewport.height);
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        const renderTask = page.render({ canvasContext: context, viewport });
        activeRenderTaskRef.current = renderTask as unknown as PdfRenderTask;

        await renderTask.promise;

        if (renderRunRef.current !== renderRun) {
          return;
        }

        activeRenderTaskRef.current = null;
      } catch (renderError) {
        const maybeError = renderError as { name?: string; message?: string };
        if (maybeError?.name === 'RenderingCancelledException') {
          return;
        }

        if (!unmounted && renderRunRef.current === renderRun) {
          const message = renderError instanceof Error ? renderError.message : 'Failed to render page.';
          setError(message);
        }
      } finally {
        if (!unmounted && renderRunRef.current === renderRun) {
          setIsRendering(false);
        }
      }
    };

    void renderActivePage();

    return () => {
      unmounted = true;
      activeRenderTaskRef.current?.cancel();
      activeRenderTaskRef.current = null;
    };
  }, [activeDocument, activePage, containerSize.height, containerSize.width, manualZoomDependency, onEffectiveZoomChange, zoomMode]);

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
