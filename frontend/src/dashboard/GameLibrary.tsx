/**
 * Why this exists: the row of game machines with the player's best score and
 * run count. Click one, or move with the arrow keys / gamepad and press
 * Enter, to drop a coin and play.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { useRef } from 'react';
import type { Run } from '../api/games.api';
import { GAMES } from '../games/registry';
import { coin } from '../games/shared/audio';
import { useGridNav } from '../input/useGridNav';
import { PixelIcon } from '../ui/PixelIcon';

interface GameLibraryProps {
  runs: Run[];
  onPlay: (slug: string) => void;
  className?: string;
}

export function GameLibrary({ runs, onPlay, className = '' }: GameLibraryProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const onKeyDown = useGridNav(gridRef, true);

  return (
    <section className={className}>
      <div className="flex items-end justify-between gap-3 mb-4">
        <h3 className="panel-title">CHOOSE YOUR GAME</h3>
        <span className="pixel text-[0.5rem] c-white hidden sm:flex items-center gap-0.5">
          <PixelIcon name="left" size={12} /><PixelIcon name="right" size={12} /><PixelIcon name="up" size={12} /><PixelIcon name="down" size={12} />
          <span className="ml-1">+ ENTER · FREE PLAY</span>
        </span>
      </div>
      <div ref={gridRef} onKeyDown={onKeyDown} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-5 sm:gap-x-4">
        {GAMES.map((game, i) => {
          const gameRuns = runs.filter((run) => run.gameId === game.slug);
          const best = Math.max(0, ...gameRuns.map((run) => run.score));
          return (
            <button
              key={game.slug}
              type="button"
              className={`tile ${game.color} group text-left flex flex-col`}
              style={{ animation: `fi .4s both ${i * 60}ms` }}
              onClick={() => {
                coin();
                onPlay(game.slug);
              }}
            >
              <span className="tone-bg block px-3 pt-3 pb-2 text-center pixel text-[0.55rem] sm:text-[0.6rem] truncate">
                {game.name.toUpperCase()}
              </span>
              <span className="relative mx-2 mt-2 bg-[var(--ink)] p-1.5">
                <span className="relative grid place-items-center aspect-[4/3] bg-[var(--ghost)] overflow-hidden">
                  <PixelIcon name={game.icon} className="w-16 h-16 sm:w-24 sm:h-24 group-hover:scale-125 group-focus-visible:scale-125 transition-transform" />
                  <span className="absolute bottom-1.5 inset-x-0 text-center opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="pixel text-[0.45rem] bg-[var(--red)] c-white px-1.5 py-1 blink">PRESS START</span>
                  </span>
                </span>
              </span>
              <span className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs font-bold">
                <span>
                  HI <span className="pixel text-[0.6rem] tone">{best}</span>
                </span>
                <span className="muted">{gameRuns.length} runs</span>
              </span>
            </button>
          );
        })}
        <div className="hidden lg:flex flex-col items-center justify-center gap-3 border-4 border-dashed border-[var(--white)] c-white">
          <PixelIcon name="joystick" size={44} />
          <span className="pixel text-[0.5rem] text-center leading-relaxed">NEW MACHINE<br />COMING SOON</span>
        </div>
      </div>
    </section>
  );
}
