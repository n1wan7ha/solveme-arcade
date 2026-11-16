/**
 * Why this exists: the end-of-game screen, like an arcade "GAME OVER": score,
 * hits, best combo, personal best and level-up messages, whether the run was
 * saved, initials entry on a new high score, and "CONTINUE?". Enter plays
 * again (with a coin drop), Escape returns to the lobby.
 * Ported from end() in solveme-arcade.html; React version drafted with an LLM (Claude Code).
 */
import { useEffect, useState } from 'react';
import { Button } from '../../ui/Button';
import { CountUp } from '../../ui/CountUp';
import { coin } from './audio';
import { InitialsEntry } from './InitialsEntry';
import { levelOf } from './level';
import type { RunRecorder } from './useRunRecorder';
import type { GameMeta, GameType, RunStats } from './types';
import { PixelIcon } from '../../ui/PixelIcon';

const HIT_LABEL: Record<GameType, string> = {
  puzzle: 'CORRECT',
  slash: 'SLICED',
  snake: 'EATEN',
  arcade: 'GATES',
};

const SAVE_LABEL = {
  idle: 'NO ATTEMPTS · NOTHING TO SAVE',
  saving: 'SAVING RUN…',
  saved: 'RUN SAVED',
  error: 'COULD NOT SAVE THIS RUN',
};

interface ResultModalProps {
  meta: GameMeta;
  stats: RunStats;
  recorder: RunRecorder;
  onPlayAgain: () => void;
  onHome: () => void;
}

export function ResultModal({ meta, stats, recorder, onPlayAgain, onHome }: ResultModalProps) {
  const previousBest = Math.max(0, ...recorder.history.filter((r) => r.gameId === meta.slug).map((r) => r.score));
  const previousTotal = recorder.history.reduce((sum, run) => sum + run.score, 0);
  const newLevel = levelOf(previousTotal + stats.score);
  const levelledUp = newLevel > levelOf(previousTotal);
  const newBest = stats.score > previousBest && stats.score > 0;
  const [signing, setSigning] = useState(newBest);

  const playAgain = () => {
    coin();
    onPlayAgain();
  };

  useEffect(() => {
    if (signing) return; // InitialsEntry owns the keys until it is done
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter') playAgain();
      if (event.key === 'Escape') onHome();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const rows = [
    { label: HIT_LABEL[meta.type], value: `${stats.correct}/${stats.attempts}` },
    { label: 'BEST COMBO', value: `x${Math.min(stats.maxCombo, 5)}` },
    { label: 'HI-SCORE', value: String(Math.max(previousBest, stats.score)) },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[var(--blue)] overflow-y-auto flex items-center justify-center p-3 fade-in">
      <div className={`cabinet ${meta.color} max-w-md w-full my-auto`} role="dialog" aria-modal="true" aria-label="Game over">
        <div className="marquee text-center">
          <div className="bulbs mb-2" aria-hidden />
          <span className="pixel text-xs inline-flex items-center gap-2"><span className="grid bg-[var(--white)] border-[3px] border-[var(--ink)] p-0.5"><PixelIcon name={meta.icon} size={20} /></span> {meta.name.toUpperCase()}</span>
        </div>

        <div className="pt-6 pb-2 px-2 text-center">
          <h3 className="print text-2xl sm:text-3xl">{newBest ? 'HI-SCORE!' : 'GAME OVER'}</h3>

          <div className="mt-6 pixel text-[0.55rem] muted">SCORE</div>
          <div className="lcd text-6xl sm:text-7xl c-blue mt-1" data-ghost={'8'.repeat(String(stats.score).length)}>
            <CountUp to={stats.score} />
          </div>

          <dl className="mt-5 grid grid-cols-3 border-[3px] border-[var(--ink)]">
            {rows.map((row, i) => (
              <div key={row.label} className={`py-2 px-1 ${i ? 'border-l-[3px] border-[var(--ink)]' : ''}`}>
                <dt className="pixel text-[0.45rem] muted">{row.label}</dt>
                <dd className="pixel text-xs mt-1.5">{row.value}</dd>
              </div>
            ))}
          </dl>

          {levelledUp && (
            <p className="mt-4 pixel text-xs bg-[var(--red)] c-white py-2 border-[3px] border-[var(--ink)]">
              LEVEL UP! LV {newLevel}
            </p>
          )}

          <p className={`mt-4 pixel text-[0.5rem] ${recorder.status === 'error' ? 'c-red' : 'muted'}`}>
            {recorder.status === 'saved' && <PixelIcon name="check" className="mr-1" />}
            {SAVE_LABEL[recorder.status]}
            {recorder.status === 'error' && (
              <button type="button" className="underline ml-2 cursor-pointer" onClick={() => void recorder.save(stats)}>
                RETRY
              </button>
            )}
          </p>
        </div>

        <div className="stripe my-4 -mx-3" />

        {signing ? (
          <InitialsEntry onDone={() => setSigning(false)} />
        ) : (
          <>
            <p className="pixel text-[0.65rem] text-center c-red blink">CONTINUE?</p>
            <div className="flex gap-3 justify-center flex-wrap mt-3">
              <Button onClick={playAgain}><PixelIcon name="play" className="mr-2" />PLAY AGAIN</Button>
              <Button variant="secondary" onClick={onHome}>LOBBY</Button>
            </div>
            <p className="text-center text-xs muted mt-3">Enter = play again · Esc = lobby</p>
          </>
        )}
      </div>
    </div>
  );
}
