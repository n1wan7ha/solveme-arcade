/**
 * Why this exists: the "SELECT GAME" pop-up opened by the START button.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { GAMES } from '../games/registry';
import { Modal } from '../ui/Modal';

interface GamePickerProps {
  open: boolean;
  onClose: () => void;
  onPlay: (slug: string) => void;
}

export function GamePicker({ open, onClose, onPlay }: GamePickerProps) {
  return (
    <Modal open={open} title="SELECT GAME" onClose={onClose}>
      <div className="grid sm:grid-cols-2 gap-3">
        {GAMES.map((game, i) => (
          <button
            key={game.slug}
            type="button"
            className={`tile ${game.color} group text-left p-4 flex gap-4 items-center`}
            style={{ animation: `fi .4s both ${i * 50}ms` }}
            onClick={() => onPlay(game.slug)}
          >
            <span className="shrink-0 w-16 h-16 rounded-lg bg-[#05030f] crt relative grid place-items-center text-4xl shadow-[inset_0_0_14px_#000]"><span className="float">{game.emoji}</span></span>
            <span>
              <span className="pixel text-[0.65rem] block leading-tight tone">
                {i + 1}. {game.name.toUpperCase()}
              </span>
              <span className="text-xs block mt-2 muted">{game.how}</span>
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
