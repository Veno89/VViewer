import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from 'pdfjs-dist';

let workerConfigured = false;

function ensurePdfWorkerConfigured(): void {
  if (workerConfigured) {
    return;
  }

  GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();
  workerConfigured = true;
}

export async function readFileAsUint8Array(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

function cloneBytes(bytes: Uint8Array): Uint8Array {
  return bytes.slice();
}

export async function loadPdfDocument(bytes: Uint8Array): Promise<PDFDocumentProxy> {
  ensurePdfWorkerConfigured();
  // pdf.js may transfer data to the worker; always pass a clone so source bytes remain usable.
  const loadingTask = getDocument({ data: cloneBytes(bytes) });
  return loadingTask.promise;
}

export async function getPdfPageCount(bytes: Uint8Array): Promise<number> {
  const document = await loadPdfDocument(bytes);

  try {
    return document.numPages;
  } finally {
    await document.destroy();
  }
}
