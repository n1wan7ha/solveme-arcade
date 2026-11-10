/**
 * Why this exists: the "SELECT GAME" pop-up opened by the START button.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { GAMES } from '../games/registry';
import { DotText } from '../ui/DotText';
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
            className={`tile ${game.color} text-left p-4 flex gap-3 items-start`}
            style={{ animation: `fi .4s both ${i * 50}ms` }}
            onClick={() => onPlay(game.slug)}
          >
            <span className="text-4xl float">{game.emoji}</span>
            <span>
              <DotText className="text-lg block leading-tight">
                {i + 1}. {game.name.toUpperCase()}
              </DotText>
              <span className="text-xs block mt-1 opacity-90">{game.how}</span>
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
