import type { PersistedPdfSession } from '@/types/pdf';

const STORAGE_KEY = 'vviewer-session-v1';
const HISTORY_KEY = 'vviewer-session-history-v1';
const MAX_HISTORY_ITEMS = 8;

export function loadPersistedSession(): PersistedPdfSession | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PersistedPdfSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function persistSession(session: PersistedPdfSession | null): void {
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore quota errors to avoid interrupting core editor flows.
  }
}

export function clearPersistedSession(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function loadSessionHistory(): PersistedPdfSession[] {
  const raw = window.localStorage.getItem(HISTORY_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as PersistedPdfSession[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(HISTORY_KEY);
    return [];
  }
}

export function persistSessionHistory(session: PersistedPdfSession | null): void {
  if (!session) {
    return;
  }

  try {
    const history = loadSessionHistory();
    const next = [session, ...history.filter((item) => item.savedAt !== session.savedAt)].slice(0, MAX_HISTORY_ITEMS);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota errors to avoid interrupting editor workflows.
  }
}

export function clearPersistedSessionHistory(): void {
  window.localStorage.removeItem(HISTORY_KEY);
}
