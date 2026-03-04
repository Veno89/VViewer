export type SessionPersistenceMode = 'metadata-only' | 'full';

const SESSION_PERSISTENCE_MODE_KEY = 'vviewer-session-persistence-mode-v1';

export function loadSessionPersistenceMode(): SessionPersistenceMode {
  const raw = window.localStorage.getItem(SESSION_PERSISTENCE_MODE_KEY);
  if (raw === 'full') {
    return 'full';
  }

  return 'metadata-only';
}

export function saveSessionPersistenceMode(mode: SessionPersistenceMode): void {
  window.localStorage.setItem(SESSION_PERSISTENCE_MODE_KEY, mode);
}
