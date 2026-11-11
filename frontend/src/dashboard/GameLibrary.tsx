/**
 * Why this exists: one tile per game with the player's best score and run
 * count. Clicking a tile starts that game.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import type { Run } from '../api/games.api';
import { GAMES } from '../games/registry';

interface GameLibraryProps {
  runs: Run[];
  onPlay: (slug: string) => void;
  className?: string;
}

export function GameLibrary({ runs, onPlay, className = '' }: GameLibraryProps) {
  return (
    <section className={className}>
      <div className="flex items-end justify-between gap-3 mb-3 px-1">
        <h3 className="panel-title neon-yellow">CHOOSE YOUR GAME</h3>
        <span className="pixel text-[0.5rem] muted hidden sm:inline">FREE PLAY · {GAMES.length} MACHINES</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {GAMES.map((game, i) => {
          const gameRuns = runs.filter((run) => run.gameId === game.slug);
          const best = Math.max(0, ...gameRuns.map((run) => run.score));
          return (
            <button
              key={game.slug}
              type="button"
              className={`tile ${game.color} group p-0 overflow-hidden text-left flex flex-col`}
              style={{ animation: `fi .4s both ${i * 60}ms` }}
              onClick={() => onPlay(game.slug)}
            >
              <span
                className="block px-3 py-2 border-b-2 border-[var(--ink)] text-center pixel text-[0.55rem] sm:text-[0.6rem] truncate"
                style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--tone) 45%, #1b1243), color-mix(in srgb, var(--tone) 15%, #0e0a24))' }}
              >
                {game.name.toUpperCase()}
              </span>
              <span className="relative m-2 mb-0 rounded-lg bg-[#05030f] crt grid place-items-center aspect-[4/3] overflow-hidden shadow-[inset_0_0_20px_#000]">
                <span
                  className="absolute inset-0 opacity-40"
                  style={{ background: 'radial-gradient(circle at 50% 60%, color-mix(in srgb, var(--tone) 50%, transparent), transparent 65%)' }}
                />
                <span className="relative text-4xl sm:text-5xl float group-hover:scale-125 transition-transform">{game.emoji}</span>
                <span className="absolute bottom-1.5 inset-x-0 text-center pixel text-[0.5rem] neon-yellow opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 blink">
                  PRESS START
                </span>
              </span>
              <span className="flex items-center justify-between gap-2 px-3 py-2.5 text-[0.7rem]">
                <span className="muted">
                  HI <b className="pixel text-[0.6rem] tone">{best}</b>
                </span>
                <span className="muted">{gameRuns.length} runs</span>
              </span>
            </button>
          );
        })}
        <div className="tile t-w hidden lg:flex flex-col items-center justify-center gap-3 opacity-50 cursor-default hover:transform-none border-dashed">
          <span className="text-4xl grayscale">🕹️</span>
          <span className="pixel text-[0.55rem] muted text-center leading-relaxed">NEW MACHINE<br />COMING SOON</span>
        </div>
      </div>
    </section>
  );
}
