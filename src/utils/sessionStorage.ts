import type { PersistedPdfSession } from '@/types/pdf';

const STORAGE_KEY = 'vviewer-session-v1';

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
