import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onDeleteSelected: () => void;
  onSelectAll: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDownload: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onExtendNextPageSelection: () => void;
  onExtendPreviousPageSelection: () => void;
}

export function useKeyboardShortcuts({
  onDeleteSelected,
  onSelectAll,
  onUndo,
  onRedo,
  onDownload,
  onNextPage,
  onPreviousPage,
  onExtendNextPageSelection,
  onExtendPreviousPageSelection,
}: KeyboardShortcutsConfig): void {
  useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      const isCtrlOrMeta = event.ctrlKey || event.metaKey;

      if (event.key === 'Delete') {
        event.preventDefault();
        onDeleteSelected();
        return;
      }

      if (isCtrlOrMeta && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        onSelectAll();
        return;
      }

      if (isCtrlOrMeta && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          onRedo();
        } else {
          onUndo();
        }
        return;
      }

      if (isCtrlOrMeta && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        onRedo();
        return;
      }

      if (isCtrlOrMeta && event.key.toLowerCase() === 's') {
        event.preventDefault();
        onDownload();
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (event.shiftKey) {
          onExtendNextPageSelection();
        } else {
          onNextPage();
        }
        return;
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        if (event.shiftKey) {
          onExtendPreviousPageSelection();
        } else {
          onPreviousPage();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [
    onDeleteSelected,
    onDownload,
    onExtendNextPageSelection,
    onExtendPreviousPageSelection,
    onNextPage,
    onPreviousPage,
    onRedo,
    onSelectAll,
    onUndo,
  ]);
}
