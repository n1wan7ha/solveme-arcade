/**
 * Why this exists: the bar chart of the last 12 runs and the 4 most recent
 * runs as an activity log.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import type { Run } from '../api/games.api';
import { findGame } from '../games/registry';
import { Card } from '../ui/Card';
import { PixelIcon } from '../ui/PixelIcon';

const CHART_RUNS = 12;
const LOG_RUNS = 4;

export function RunHistory({ runs, className = '' }: { runs: Run[]; className?: string }) {
  const chartRuns = runs.slice(0, CHART_RUNS).reverse(); // oldest on the left
  const tallest = Math.max(10, ...chartRuns.map((run) => run.score));

  return (
    <Card className={`p-4 sm:p-5 ${className}`}>
      <h3 className="panel-title">LAST 12 RUNS</h3>
      <p className="text-xs mt-3 mb-3">
        <i className="inline-block w-3 h-3 bg-[var(--blue)] border-2 border-[var(--ink)] align-middle mr-1" /> action
        <i className="inline-block w-3 h-3 bg-[var(--red)] border-2 border-[var(--ink)] align-middle ml-3 mr-1" /> puzzle
        <span className="muted ml-2">· hover for details</span>
      </p>
      {/* Bars are stacks of solid blocks, like a pixel level meter */}
      <div className="flex items-end gap-1.5 h-36 border-b-4 border-l-4 border-[var(--ink)] pl-1.5">
        {chartRuns.length === 0 && <p className="text-sm muted self-center">Play a game to see your progress.</p>}
        {chartRuns.map((run, i) => {
          const game = findGame(run.gameId)!;
          const colour = game.type === 'puzzle' ? 'var(--red)' : 'var(--blue)';
          return (
            <div
              key={run.id}
              title={`${game.name}: ${run.score}`}
              className="flex-1 hover:opacity-70"
              style={{
                height: `${Math.max(6, (run.score / tallest) * 100)}%`,
                background: `repeating-linear-gradient(0deg, ${colour} 0 9px, transparent 9px 12px)`,
                transformOrigin: 'bottom',
                animation: `grow .5s steps(6) both ${i * 50}ms`,
              }}
            />
          );
        })}
      </div>

      <h4 className="lab mt-5">ACTIVITY LOG</h4>
      <div className="text-sm border-[3px] border-[var(--ink)]">
        {runs.slice(0, LOG_RUNS).map((run, i) => {
          const game = findGame(run.gameId)!;
          return (
            <div key={run.id} className={`flex justify-between px-3 py-2 ${i ? 'border-t-[3px] border-[var(--ink)]' : ''}`}>
              <span className="font-bold flex items-center gap-2"><PixelIcon name={game.icon} size={18} /> {game.name}</span>
              <span className="pixel text-xs c-blue self-center">{run.score}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
