import type { SessionPersistenceMode } from '@/types/pdf';

interface PrivacyPanelDialogProps {
  isOpen: boolean;
  sessionPersistenceMode: SessionPersistenceMode;
  onSessionPersistenceModeChange: (mode: SessionPersistenceMode) => void;
  onClose: () => void;
}

export function PrivacyPanelDialog({ isOpen, sessionPersistenceMode, onSessionPersistenceModeChange, onClose }: PrivacyPanelDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Privacy details">
      <div className="w-full max-w-lg rounded-2xl border border-cyan-200 bg-white p-5 shadow-2xl dark:border-cyan-900/50 dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Privacy by Design</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
          <li>- No account required.</li>
          <li>- No telemetry or analytics calls built into the app flow.</li>
          <li>- PDF processing runs locally in your browser.</li>
          <li>- No ad network scripts.</li>
          <li>- Session restore data is stored in your browser local storage only.</li>
        </ul>
        <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <p className="font-semibold">Session Persistence Mode</p>
          <p className="mt-1">Choose whether local session snapshots include raw PDF bytes.</p>
          <div className="mt-3 space-y-2">
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="session-persistence-mode"
                checked={sessionPersistenceMode === 'metadata-only'}
                onChange={() => onSessionPersistenceModeChange('metadata-only')}
              />
              <span>
                <span className="font-medium">Metadata only (recommended)</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">Stores page order, rotation, and selection metadata without document content.</span>
              </span>
            </label>
            <label className="flex items-start gap-2">
              <input
                type="radio"
                name="session-persistence-mode"
                checked={sessionPersistenceMode === 'full'}
                onChange={() => onSessionPersistenceModeChange('full')}
              />
              <span>
                <span className="font-medium">Full session restore</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">Also stores PDF bytes in local storage so sessions can be reopened without re-importing files.</span>
              </span>
            </label>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
