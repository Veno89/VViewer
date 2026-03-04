import { useCallback, useEffect, useState } from 'react';
import type { PersistedPdfSession } from '@/types/pdf';
import {
  clearPersistedSession,
  clearPersistedSessionHistory,
  loadPersistedSession,
  loadSessionHistory,
  persistSession,
  persistSessionHistory,
} from '@/utils/sessionStorage';

interface UseSessionRecoveryOptions {
  maxSessionHistory: number;
  persistDebounceMs: number;
  getSessionSnapshot: () => PersistedPdfSession | null;
  persistDeps: unknown[];
  hydrateSession: (session: PersistedPdfSession) => void;
  clearDocument: () => void;
  addOperationLogFromCurrentState: (label: string) => void;
}

export function useSessionRecovery({
  maxSessionHistory,
  persistDebounceMs,
  getSessionSnapshot,
  persistDeps,
  hydrateSession,
  clearDocument,
  addOperationLogFromCurrentState,
}: UseSessionRecoveryOptions) {
  const [restorableSession, setRestorableSession] = useState<PersistedPdfSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<PersistedPdfSession[]>([]);

  useEffect(() => {
    const persisted = loadPersistedSession();
    if (persisted) {
      setRestorableSession(persisted);
    }

    setSessionHistory(loadSessionHistory().slice(0, maxSessionHistory));
  }, [maxSessionHistory]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const snapshot = getSessionSnapshot();
      persistSession(snapshot);
      persistSessionHistory(snapshot);
      setSessionHistory(loadSessionHistory().slice(0, maxSessionHistory));
    }, persistDebounceMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [getSessionSnapshot, maxSessionHistory, persistDebounceMs, ...persistDeps]);

  const restorePreviousSession = useCallback(() => {
    if (!restorableSession) {
      return;
    }

    hydrateSession(restorableSession);
    setRestorableSession(null);
    addOperationLogFromCurrentState('Restored previous session');
  }, [addOperationLogFromCurrentState, hydrateSession, restorableSession]);

  const dismissPreviousSession = useCallback(() => {
    clearPersistedSession();
    clearPersistedSessionHistory();
    clearDocument();
    setRestorableSession(null);
    setSessionHistory([]);
  }, [clearDocument]);

  const restoreHistorySnapshot = useCallback(
    (snapshot: PersistedPdfSession) => {
      hydrateSession(snapshot);
      setRestorableSession(null);
      addOperationLogFromCurrentState(`Restored snapshot ${new Date(snapshot.savedAt).toLocaleTimeString()}`);
    },
    [addOperationLogFromCurrentState, hydrateSession],
  );

  return {
    restorableSession,
    sessionHistory,
    restorePreviousSession,
    dismissPreviousSession,
    restoreHistorySnapshot,
  };
}
