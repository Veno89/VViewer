import { useCallback, useState } from 'react';
import { usePdfStore } from '@/stores/pdfStore';
import type { OperationLogEntry, PageInfo } from '@/types/pdf';

const DEFAULT_MAX_OPERATION_LOG = 40;

function clonePages(pages: PageInfo[]): PageInfo[] {
  return pages.map((page) => ({ ...page }));
}

export function useOperationLog(maxEntries = DEFAULT_MAX_OPERATION_LOG) {
  const [operationLog, setOperationLog] = useState<OperationLogEntry[]>([]);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const addOperationLog = useCallback((label: string, snapshotPages?: PageInfo[]): void => {
    const entry: OperationLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
      timestamp: new Date().toISOString(),
      snapshotPages,
    };

    setOperationLog((previous) => [entry, ...previous].slice(0, maxEntries));
    setLiveAnnouncement(label);
  }, [maxEntries]);

  const addOperationLogFromCurrentState = useCallback(
    (label: string): void => {
      const currentPages = clonePages(usePdfStore.getState().pages);
      addOperationLog(label, currentPages);
    },
    [addOperationLog],
  );

  return {
    operationLog,
    liveAnnouncement,
    addOperationLog,
    addOperationLogFromCurrentState,
  };
}
