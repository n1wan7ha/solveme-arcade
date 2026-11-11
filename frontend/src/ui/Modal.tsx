/**
 * Why this exists: the prototype's dark overlay with a card in the middle.
 * Closes on Escape or a click outside the card.
 * Drafted with an LLM (Claude Code).
 */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#03020c]/80 backdrop-blur-sm flex items-center justify-center p-3 fade-in"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-3xl max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b-2 border-[var(--line)]">
          <h2 className="pixel text-base sm:text-lg neon-yellow">{title}</h2>
          <Button variant="secondary" className="px-3 py-1.5" onClick={onClose} aria-label="Close">
            ✕
          </Button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
