/**
 * Why this exists: the end-of-game screen, in the style of an arcade "GAME
 * OVER": score, hits, best combo, personal best and level-up messages,
 * whether the run was saved, and a "continue?" choice. Enter plays again.
 * Ported from end() in solveme-arcade.html; React version drafted with an LLM (Claude Code).
 */
import { useEffect } from 'react';
import { Button } from '../../ui/Button';
import { CountUp } from '../../ui/CountUp';
import { levelOf } from './level';
import type { RunRecorder } from './useRunRecorder';
import type { GameMeta, GameType, RunStats } from './types';

const HIT_LABEL: Record<GameType, string> = {
  puzzle: 'CORRECT',
  slash: 'SLICED',
  snake: 'EATEN',
  arcade: 'GATES',
};

const SAVE_LABEL = {
  idle: 'NO ATTEMPTS · NOTHING TO SAVE',
  saving: 'SAVING RUN…',
  saved: 'RUN SAVED ✓',
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

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Enter') onPlayAgain();
      if (event.key === 'Escape') onHome();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onPlayAgain, onHome]);

  const rows = [
    { label: HIT_LABEL[meta.type], value: `${stats.correct}/${stats.attempts}` },
    { label: 'BEST COMBO', value: `x${Math.min(stats.maxCombo, 5)}` },
    { label: 'HI-SCORE', value: String(Math.max(previousBest, stats.score)) },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#03020c]/85 backdrop-blur-sm flex items-center justify-center p-3 fade-in">
      <div className={`cabinet ${meta.color} max-w-md w-full`} role="dialog" aria-modal="true" aria-label="Game over">
        <div className="marquee text-center">
          <span className="pixel text-xs neon-yellow">{meta.emoji} {meta.name.toUpperCase()}</span>
        </div>
        <div className="bezel mt-3">
          <div className="screen crt px-5 py-7 text-center bg-[radial-gradient(ellipse_at_center,#1c1543,#05030f)]">
            <h3 className={`pixel text-2xl sm:text-3xl ${newBest ? 'neon-yellow' : 'neon-pink'}`}>
              {newBest ? 'NEW HI-SCORE!' : 'GAME OVER'}
            </h3>

            <div className="mt-5 pixel text-[0.6rem] muted">SCORE</div>
            <div className="pixel text-4xl sm:text-5xl neon-cyan mt-1">
              <CountUp to={stats.score} />
            </div>

            <dl className="mt-6 space-y-2 text-left max-w-[260px] mx-auto">
              {rows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 border-b border-dashed border-[var(--line)] pb-1">
                  <dt className="pixel text-[0.6rem] muted">{row.label}</dt>
                  <dd className="pixel text-[0.7rem] neon-green">{row.value}</dd>
                </div>
              ))}
            </dl>

            {levelledUp && <p className="mt-5 pixel text-sm neon-yellow blink">LEVEL UP! LV {newLevel}</p>}

            <p className={`mt-5 pixel text-[0.5rem] ${recorder.status === 'error' ? 'neon-pink' : 'muted'}`}>
              {SAVE_LABEL[recorder.status]}
              {recorder.status === 'error' && (
                <button type="button" className="underline ml-2 cursor-pointer" onClick={() => void recorder.save(stats)}>
                  RETRY
                </button>
              )}
            </p>
          </div>
        </div>

        <p className="pixel text-[0.65rem] text-center neon-yellow mt-4 blink">CONTINUE?</p>
        <div className="flex gap-3 justify-center flex-wrap mt-3">
          <Button className="glow" onClick={onPlayAgain}>▶ PLAY AGAIN</Button>
          <Button variant="secondary" onClick={onHome}>LOBBY</Button>
        </div>
        <p className="text-center text-[0.65rem] muted mt-3">Enter = play again · Esc = lobby</p>
      </div>
    </div>
  );
}
