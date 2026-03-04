interface UndoToastProps {
  message: string;
  visible: boolean;
  onUndo: () => void;
}

export function UndoToast({ message, visible, onUndo }: UndoToastProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-3 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
      <span>{message}</span>
      <button
        type="button"
        className="rounded bg-white/20 px-2 py-1 text-xs hover:bg-white/30"
        onClick={onUndo}
        aria-label="Undo last action"
      >
        Undo
      </button>
    </div>
  );
}
