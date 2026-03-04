import { PDFDocument, degrees } from 'pdf-lib';
import type { PageInfo, PdfSourceFile } from '@/types/pdf';

export type ExportProfile = 'balanced' | 'print' | 'web';

interface ExportPdfOptions {
  profile?: ExportProfile;
  onProgress?: (completed: number, total: number) => void;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function getYieldEvery(profile: ExportProfile): number {
  if (profile === 'print') {
    return 20;
  }

  if (profile === 'web') {
    return 8;
  }

  return 12;
}

export async function exportPdf(
  sourceFiles: PdfSourceFile[],
  pages: PageInfo[],
  options: ExportPdfOptions = {},
): Promise<Uint8Array> {
  const output = await PDFDocument.create();
  const sourceDocumentCache = new Map<number, PDFDocument>();
  const profile = options.profile ?? 'balanced';
  const yieldEvery = getYieldEvery(profile);

  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index];
    const sourceFile = sourceFiles.find((file) => file.index === page.sourceFileIndex);
    if (!sourceFile) {
      throw new Error(`Source file not found for page ${page.id}`);
    }

    let sourceDocument = sourceDocumentCache.get(sourceFile.index);
    if (!sourceDocument) {
      sourceDocument = await PDFDocument.load(sourceFile.bytes);
      sourceDocumentCache.set(sourceFile.index, sourceDocument);
    }

    const [copiedPage] = await output.copyPages(sourceDocument, [page.sourcePageIndex]);
    copiedPage.setRotation(degrees(page.rotation));
    output.addPage(copiedPage);

    options.onProgress?.(index + 1, pages.length);
    if ((index + 1) % yieldEvery === 0) {
      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 0);
      });
    }
  }

  return output.save();
}

export function downloadPdf(bytes: Uint8Array, filename: string): void {
  const blob = new Blob([toArrayBuffer(bytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 500);
}
