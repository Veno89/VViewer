import { useCallback, useState } from 'react';
import { downloadPdf, exportPdf, type ExportProfile } from '@/services/pdfExporter';
import { printPdf } from '@/services/pdfPrinter';
import type { PageInfo, PdfSourceFile } from '@/types/pdf';
import { filterEvenPagesByCurrentOrder, filterOddPagesByCurrentOrder } from '@/utils/pageTools';

interface UsePdfExportOptions {
  sourceFiles: PdfSourceFile[];
  pages: PageInfo[];
  selectedIds: Set<string>;
  setError: (message: string | null) => void;
  addOperationLogFromCurrentState: (label: string) => void;
}

export function usePdfExport({
  sourceFiles,
  pages,
  selectedIds,
  setError,
  addOperationLogFromCurrentState,
}: UsePdfExportOptions) {
  const [exportProfile, setExportProfile] = useState<ExportProfile>('balanced');
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const runExport = useCallback(
    async (targetPages: PageInfo[], fileName: string, profile: ExportProfile): Promise<void> => {
      if (targetPages.length === 0) {
        return;
      }

      try {
        setIsExporting(true);
        setExportProgress(0);
        const bytes = await exportPdf(sourceFiles, targetPages, {
          profile,
          onProgress: (completed, total) => {
            const percent = Math.round((completed / Math.max(total, 1)) * 100);
            setExportProgress(percent);
          },
        });
        downloadPdf(bytes, fileName);
        setError(null);
      } catch (downloadError) {
        const message = downloadError instanceof Error ? downloadError.message : 'Failed to export PDF.';
        setError(message);
      } finally {
        setIsExporting(false);
      }
    },
    [setError, sourceFiles],
  );

  const handleDownload = useCallback(async (): Promise<boolean> => {
    if (pages.length === 0) {
      return false;
    }

    const exportName = `vviewer-edited-${new Date().toISOString().slice(0, 10)}.pdf`;
    await runExport(pages, exportName, exportProfile);
    addOperationLogFromCurrentState(`Exported PDF (${exportProfile})`);
    return true;
  }, [addOperationLogFromCurrentState, exportProfile, pages, runExport]);

  const handleExtractPages = useCallback(
    async (targetPages: PageInfo[], fileName: string, label: string): Promise<void> => {
      if (targetPages.length === 0) {
        setError('No pages matched that extract preset.');
        return;
      }

      await runExport(targetPages, fileName, 'balanced');
      addOperationLogFromCurrentState(label);
      setError(null);
    },
    [addOperationLogFromCurrentState, runExport, setError],
  );

  const handleExtractSelected = useCallback(async (): Promise<void> => {
    const selectedPages = pages.filter((page) => selectedIds.has(page.id));
    if (selectedPages.length === 0) {
      setError('Select one or more pages to extract.');
      return;
    }

    await handleExtractPages(selectedPages, 'vviewer-extract.pdf', `Extracted ${selectedPages.length} page(s)`);
  }, [handleExtractPages, pages, selectedIds, setError]);

  const handleExtractOdd = useCallback(async (): Promise<void> => {
    await handleExtractPages(filterOddPagesByCurrentOrder(pages), 'vviewer-odd-pages.pdf', 'Extracted odd pages');
  }, [handleExtractPages, pages]);

  const handleExtractEven = useCallback(async (): Promise<void> => {
    await handleExtractPages(filterEvenPagesByCurrentOrder(pages), 'vviewer-even-pages.pdf', 'Extracted even pages');
  }, [handleExtractPages, pages]);

  const handlePrint = useCallback(async (): Promise<void> => {
    if (pages.length === 0) {
      return;
    }

    try {
      const bytes = await exportPdf(sourceFiles, pages, { profile: 'print' });
      printPdf(bytes);
      addOperationLogFromCurrentState('Sent document to print');
      setError(null);
    } catch (printError) {
      const message = printError instanceof Error ? printError.message : 'Failed to print PDF.';
      setError(message);
    }
  }, [addOperationLogFromCurrentState, pages, setError, sourceFiles]);

  return {
    exportProfile,
    setExportProfile,
    exportProgress,
    isExporting,
    handleDownload,
    handleExtractSelected,
    handleExtractOdd,
    handleExtractEven,
    handlePrint,
  };
}
