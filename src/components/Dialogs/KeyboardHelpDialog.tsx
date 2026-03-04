interface KeyboardHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Delete', action: 'Delete selected pages' },
  { key: 'Ctrl+A', action: 'Select all pages' },
  { key: 'Ctrl+Z', action: 'Undo' },
  { key: 'Ctrl+Shift+Z', action: 'Redo' },
  { key: 'Ctrl+S', action: 'Download PDF' },
  { key: 'Arrow Up/Down', action: 'Move active page selection' },
  { key: 'Shift+Arrow Up/Down', action: 'Extend range selection' },
];

export function KeyboardHelpDialog({ isOpen, onClose }: KeyboardHelpDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className="w-full max-w-md rounded-2xl border border-cyan-200 bg-white p-5 shadow-2xl dark:border-cyan-900/50 dark:bg-slate-950">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Keyboard Shortcuts</h2>
        <ul className="mt-4 space-y-2">
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.key} className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-900/60">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{shortcut.key}</span>
              <span className="text-slate-600 dark:text-slate-300">{shortcut.action}</span>
            </li>
          ))}
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
