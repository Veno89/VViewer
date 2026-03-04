interface PrivacyPanelDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPanelDialog({ isOpen, onClose }: PrivacyPanelDialogProps) {
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
