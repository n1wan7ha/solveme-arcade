/**
 * Why this exists: the "SELECT GAME" pop-up opened by the START button.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { useEffect, useRef } from 'react';
import { GAMES } from '../games/registry';
import { coin } from '../games/shared/audio';
import { useGridNav } from '../input/useGridNav';
import { Modal } from '../ui/Modal';
import { PixelIcon } from '../ui/PixelIcon';

interface GamePickerProps {
  open: boolean;
  onClose: () => void;
  onPlay: (slug: string) => void;
}

export function GamePicker({ open, onClose, onPlay }: GamePickerProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const onKeyDown = useGridNav(gridRef);

  // Focus the first machine so the keyboard / gamepad can choose at once.
  useEffect(() => {
    if (open) gridRef.current?.querySelector('button')?.focus();
  }, [open]);

  return (
    <Modal open={open} title="SELECT GAME" onClose={onClose}>
      <div ref={gridRef} onKeyDown={onKeyDown} className="grid sm:grid-cols-2 gap-4">
        {GAMES.map((game, i) => (
          <button
            key={game.slug}
            type="button"
            className={`tile ${game.color} group text-left flex items-stretch`}
            style={{ animation: `fi .4s both ${i * 50}ms` }}
            onClick={() => {
              coin();
              onPlay(game.slug);
            }}
          >
            <span className="tone-bg shrink-0 w-20 grid place-items-center">
              <span className="bg-[var(--white)] border-[3px] border-[var(--ink)] p-1 grid"><PixelIcon name={game.icon} size={40} /></span>
            </span>
            <span className="p-3 min-w-0">
              <span className="pixel text-[0.6rem] block leading-tight">
                {i + 1}. {game.name.toUpperCase()}
              </span>
              <span className="text-xs block mt-2">{game.how}</span>
            </span>
          </button>
        ))}
      </div>
      <p className="pixel text-[0.5rem] text-center muted mt-4">ARROWS / D-PAD TO CHOOSE · ENTER / A TO PLAY · ESC / B TO CLOSE</p>
    </Modal>
  );
}
