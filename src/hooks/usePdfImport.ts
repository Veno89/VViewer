import { useCallback, useRef, type ChangeEvent } from 'react';
import { readFileAsUint8Array } from '@/services/pdfLoader';

interface UsePdfImportOptions {
  loadPdf: (bytes: Uint8Array, fileName?: string) => Promise<void>;
  setError: (message: string | null) => void;
  onPdfLoaded: (fileName: string) => void;
  maxFileWarningBytes: number;
}

export function usePdfImport({ loadPdf, setError, onPdfLoaded, maxFileWarningBytes }: UsePdfImportOptions) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const loadFiles = useCallback(
    async (files: File[]): Promise<void> => {
      for (const file of files) {
        const isPdfType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdfType) {
          setError(`Skipped ${file.name}: only PDF files are supported.`);
          continue;
        }

        if (file.size > maxFileWarningBytes) {
          setError(`Warning: ${file.name} is larger than 50 MB and may render slowly.`);
        }

        try {
          const bytes = await readFileAsUint8Array(file);
          await loadPdf(bytes, file.name);
          onPdfLoaded(file.name);
        } catch (fileError) {
          const message = fileError instanceof Error ? fileError.message : 'Unknown error';
          setError(`Failed to load ${file.name}: ${message}`);
        }
      }
    },
    [loadPdf, maxFileWarningBytes, onPdfLoaded, setError],
  );

  const handleHiddenInputChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
      const files = Array.from(event.target.files ?? []).filter((file) => file.type === 'application/pdf');
      if (files.length > 0) {
        await loadFiles(files);
      }

      event.target.value = '';
    },
    [loadFiles],
  );

  return {
    fileInputRef,
    openFileDialog,
    loadFiles,
    handleHiddenInputChange,
  };
}
