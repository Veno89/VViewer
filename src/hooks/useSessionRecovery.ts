import { useCallback, useEffect, useState } from 'react';
import type { PersistedPdfSession, SessionPersistenceMode } from '@/types/pdf';
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
  sessionPersistenceMode: SessionPersistenceMode;
  getSessionSnapshot: (options?: { includeDocumentBytes?: boolean }) => PersistedPdfSession | null;
  persistDeps: unknown[];
  hydrateSession: (session: PersistedPdfSession) => boolean;
  clearDocument: () => void;
  addOperationLogFromCurrentState: (label: string) => void;
}

export function useSessionRecovery({
  maxSessionHistory,
  persistDebounceMs,
  sessionPersistenceMode,
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
      const snapshot = getSessionSnapshot({
        includeDocumentBytes: sessionPersistenceMode === 'full',
      });
      persistSession(snapshot);
      persistSessionHistory(snapshot);
      setSessionHistory(loadSessionHistory().slice(0, maxSessionHistory));
    }, persistDebounceMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [getSessionSnapshot, maxSessionHistory, persistDebounceMs, sessionPersistenceMode, ...persistDeps]);

  const restorePreviousSession = useCallback(() => {
    if (!restorableSession) {
      return;
    }

    const restored = hydrateSession(restorableSession);
    if (restored) {
      setRestorableSession(null);
      addOperationLogFromCurrentState('Restored previous session');
    }
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
      const restored = hydrateSession(snapshot);
      if (restored) {
        setRestorableSession(null);
        addOperationLogFromCurrentState(`Restored snapshot ${new Date(snapshot.savedAt).toLocaleTimeString()}`);
      }
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
