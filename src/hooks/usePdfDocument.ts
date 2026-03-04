import { useEffect, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { loadPdfDocument } from '@/services/pdfLoader';
import type { PdfSourceFile } from '@/types/pdf';

interface UsePdfDocumentResult {
  documents: Map<number, PDFDocumentProxy>;
  isLoading: boolean;
  error: string | null;
}

export function usePdfDocument(sourceFiles: PdfSourceFile[]): UsePdfDocumentResult {
  const [documents, setDocuments] = useState<Map<number, PDFDocumentProxy>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadedDocuments: PDFDocumentProxy[] = [];

    const loadDocuments = async (): Promise<void> => {
      if (sourceFiles.length === 0) {
        setDocuments(new Map());
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const entries = await Promise.all(
          sourceFiles.map(async (sourceFile) => {
            const document = await loadPdfDocument(sourceFile.bytes);
            return [sourceFile.index, document] as const;
          }),
        );

        loadedDocuments = entries.map(([, document]) => document);

        if (cancelled) {
          await Promise.all(entries.map(([, document]) => document.destroy()));
          return;
        }

        setDocuments(new Map(entries));
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        const message = loadError instanceof Error ? loadError.message : 'Failed to load PDF document.';
        setError(message);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadDocuments();

    return () => {
      cancelled = true;
      loadedDocuments.forEach((document) => {
        void document.destroy();
      });
    };
  }, [sourceFiles]);

  return { documents, isLoading, error };
}
