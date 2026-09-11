import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const EXIT_MS = 150;

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Themed modal dialog with focus management, Escape/overlay close, body
 * scroll lock, and 150ms scale-fade enter/exit transitions.
 */
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Keep the panel mounted briefly after isOpen flips false so the exit
  // transition can play before unmount.
  const [mounted, setMounted] = useState(isOpen);
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const timeout = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-scrim/60 transition-opacity duration-150 ${
          shown ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`relative bg-surface rounded-2xl shadow-lift max-w-lg w-full max-h-[85vh] overflow-y-auto outline-none transition-all duration-150 ${
          shown ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {title && (
          <h2 id={titleId} className="px-6 pt-6 text-lg font-semibold text-ink">
            {title}
          </h2>
        )}
        <div className={title ? 'p-6 pt-3' : 'p-6'}>{children}</div>
      </div>
    </div>
  );
}
