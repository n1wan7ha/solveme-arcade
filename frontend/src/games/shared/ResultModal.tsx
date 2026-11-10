/**
 * Why this exists: the end-of-game card: score, hits, best combo, personal
 * best and level-up messages, whether the run was saved, and the next step.
 * Ported from end() in solveme-arcade.html; React version drafted with an LLM (Claude Code).
 */
import { Button } from '../../ui/Button';
import { DotText } from '../../ui/DotText';
import { levelOf } from './level';
import type { RunRecorder } from './useRunRecorder';
import type { GameMeta, GameType, RunStats } from './types';

const HIT_LABEL: Record<GameType, string> = {
  puzzle: 'Correct answers',
  slash: 'Fruits sliced',
  snake: 'Food eaten',
  arcade: 'Gates cleared',
};

const SAVE_LABEL = {
  idle: 'No attempts, so nothing to save.',
  saving: 'Saving your run…',
  saved: 'Run saved ✓',
  error: 'Could not save this run.',
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

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0f2c]/70 flex items-center justify-center p-3 fade-in">
      <div className="card p-6 max-w-sm w-full text-center" role="dialog" aria-modal="true">
        <div className="text-5xl float">{meta.emoji}</div>
        <DotText as="h3" className="text-2xl mt-2 block">
          {stats.score > previousBest && stats.score > 0 ? 'New personal best!' : `${meta.name} complete`}
        </DotText>
        <p className="my-4">
          Score <DotText className="tx-b text-4xl">{stats.score}</DotText>
          <br />
          {HIT_LABEL[meta.type]}: {stats.correct} of {stats.attempts}
          <br />
          Best combo: x{Math.min(stats.maxCombo, 5)}
          {levelledUp && (
            <>
              <br />
              <b className="tx-r">LEVEL UP! Level {newLevel}</b>
            </>
          )}
        </p>
        <p className={`text-xs mb-4 ${recorder.status === 'error' ? 'tx-r font-bold' : 'opacity-70'}`}>
          {SAVE_LABEL[recorder.status]}
          {recorder.status === 'error' && (
            <button type="button" className="underline ml-2 cursor-pointer" onClick={() => void recorder.save(stats)}>
              Retry
            </button>
          )}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button onClick={onPlayAgain}>PLAY AGAIN</Button>
          <Button variant="secondary" onClick={onHome}>DASHBOARD</Button>
        </div>
      </div>
    </div>
  );
}
