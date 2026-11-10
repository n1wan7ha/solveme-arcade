/**
 * Why this exists: one tile per game with the player's best score and run
 * count. Clicking a tile starts that game.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import type { Run } from '../api/games.api';
import { GAMES } from '../games/registry';
import { Card } from '../ui/Card';
import { DotText } from '../ui/DotText';

interface GameLibraryProps {
  runs: Run[];
  onPlay: (slug: string) => void;
  className?: string;
}

export function GameLibrary({ runs, onPlay, className = '' }: GameLibraryProps) {
  return (
    <Card className={`p-4 sm:p-5 ${className}`}>
      <DotText as="h3" className="text-xl">GAME LIBRARY</DotText>
      <p className="text-xs opacity-70 mb-3">Tap a tile to play at once.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {GAMES.map((game, i) => {
          const gameRuns = runs.filter((run) => run.gameId === game.slug);
          const best = Math.max(0, ...gameRuns.map((run) => run.score));
          return (
            <button
              key={game.slug}
              type="button"
              className={`tile ${game.color} p-3 flex items-center gap-3 text-left`}
              style={{ animation: `fi .4s both ${i * 60}ms` }}
              onClick={() => onPlay(game.slug)}
            >
              <span className="text-3xl">{game.emoji}</span>
              <span className="flex-1 min-w-0">
                <DotText className="block leading-none text-lg">
                  {i + 1}. {game.name.toUpperCase()}
                </DotText>
                <span className="text-xs opacity-90">
                  BEST {best} · {gameRuns.length} RUNS
                </span>
              </span>
              <DotText className="text-2xl">▶</DotText>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
