import { PDFDocument, degrees } from 'pdf-lib';
import type { PageInfo, PdfSourceFile } from '@/types/pdf';

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export async function exportPdf(sourceFiles: PdfSourceFile[], pages: PageInfo[]): Promise<Uint8Array> {
  const output = await PDFDocument.create();
  const sourceDocumentCache = new Map<number, PDFDocument>();

  for (const page of pages) {
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
