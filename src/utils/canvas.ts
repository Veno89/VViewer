import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PageRotation } from '@/types/pdf';

export interface RenderResult {
  width: number;
  height: number;
}

export async function renderPageToDataUrl(
  pdfDocument: PDFDocumentProxy,
  pageIndex: number,
  scale: number,
  rotation: PageRotation,
): Promise<string> {
  const page = await pdfDocument.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale, rotation });

  const canvas = window.document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is not available.');
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL('image/png');
}

export async function renderPageToCanvas(
  canvas: HTMLCanvasElement,
  pdfDocument: PDFDocumentProxy,
  pageIndex: number,
  scale: number,
  rotation: PageRotation,
): Promise<RenderResult> {
  const page = await pdfDocument.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale, rotation });
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is not available.');
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({ canvasContext: context, viewport }).promise;

  return {
    width: canvas.width,
    height: canvas.height,
  };
}
