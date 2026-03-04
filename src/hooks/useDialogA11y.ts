import { useEffect } from 'react';

const FOCUSABLE_SELECTORS =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface UseDialogA11yOptions {
  isOpen: boolean;
  container: HTMLElement | null;
  onClose: () => void;
  initialFocus?: HTMLElement | null;
}

export function useDialogA11y({ isOpen, container, onClose, initialFocus }: UseDialogA11yOptions): void {
  useEffect(() => {
    if (!isOpen || !container) {
      return;
    }

    const previousFocus = document.activeElement as HTMLElement | null;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS));
    const firstFocusable = focusable[0] ?? null;
    const lastFocusable = focusable[focusable.length - 1] ?? null;

    (initialFocus ?? firstFocusable ?? container).focus();

    const handleKeydown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !firstFocusable || !lastFocusable) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    };
  }, [container, initialFocus, isOpen, onClose]);
}