import { useEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PageInfo, ZoomMode } from '@/types/pdf';
import { renderPageToCanvas } from '@/utils/canvas';

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
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeDocument = useMemo(() => {
    if (!activePage) {
      return null;
    }

    return documents.get(activePage.sourceFileIndex) ?? null;
  }, [activePage, documents]);

  useEffect(() => {
    let cancelled = false;

    const renderActivePage = async (): Promise<void> => {
      if (!canvasRef.current || !activePage || !activeDocument) {
        return;
      }

      setIsRendering(true);
      setError(null);

      try {
        let scale = zoom;

        if (zoomMode !== 'manual') {
          const page = await activeDocument.getPage(activePage.sourcePageIndex + 1);
          const baseViewport = page.getViewport({ scale: 1, rotation: activePage.rotation });
          const containerWidth = Math.max((containerRef.current?.clientWidth ?? 900) - 48, 200);
          const containerHeight = Math.max((containerRef.current?.clientHeight ?? 700) - 48, 200);

          if (zoomMode === 'fit-width') {
            scale = containerWidth / baseViewport.width;
          } else {
            scale = Math.min(containerWidth / baseViewport.width, containerHeight / baseViewport.height);
          }
        }

        const clampedScale = Math.max(0.5, Math.min(2, scale));
        onEffectiveZoomChange?.(clampedScale);

        await renderPageToCanvas(
          canvasRef.current,
          activeDocument,
          activePage.sourcePageIndex,
          clampedScale,
          activePage.rotation,
        );
      } catch (renderError) {
        if (!cancelled) {
          const message = renderError instanceof Error ? renderError.message : 'Failed to render page.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    };

    void renderActivePage();

    return () => {
      cancelled = true;
    };
  }, [activeDocument, activePage, onEffectiveZoomChange, zoom, zoomMode]);

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
