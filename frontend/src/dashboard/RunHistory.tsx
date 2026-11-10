/**
 * Why this exists: the bar chart of the last 12 runs and the 4 most recent
 * runs as an activity log.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import type { Run } from '../api/games.api';
import { findGame } from '../games/registry';
import { Card } from '../ui/Card';
import { DotText } from '../ui/DotText';

const CHART_RUNS = 12;
const LOG_RUNS = 4;

export function RunHistory({ runs, className = '' }: { runs: Run[]; className?: string }) {
  const chartRuns = runs.slice(0, CHART_RUNS).reverse(); // oldest on the left
  const tallest = Math.max(10, ...chartRuns.map((run) => run.score));

  return (
    <Card className={`p-4 sm:p-5 ${className}`}>
      <DotText as="h3" className="text-xl">LAST 12 RUNS</DotText>
      <p className="text-xs opacity-70 mb-3">Blue = action games, red = puzzles. Hover for details.</p>
      <div className="flex items-end gap-1.5 h-32 border-b-[3px] border-[#0a0f2c]">
        {chartRuns.length === 0 && (
          <p className="text-sm opacity-60 self-center">Play a game to see your progress.</p>
        )}
        {chartRuns.map((run, i) => {
          const game = findGame(run.gameId)!;
          return (
            <div
              key={run.id}
              title={`${game.name}: ${run.score}`}
              className={`flex-1 bd rounded-t hover:opacity-70 ${game.type === 'puzzle' ? 'bg-r' : 'bg-b'}`}
              style={{
                height: `${Math.max(4, (run.score / tallest) * 100)}%`,
                transformOrigin: 'bottom',
                animation: `grow .6s both ${i * 50}ms`,
              }}
            />
          );
        })}
      </div>

      <h4 className="lab mt-4">Activity log</h4>
      <div className="space-y-2 text-sm">
        {runs.slice(0, LOG_RUNS).map((run) => {
          const game = findGame(run.gameId)!;
          return (
            <div key={run.id} className="flex justify-between bd rounded-lg px-3 py-1.5">
              <span>{game.emoji} {game.name}</span>
              <b>{run.score}</b>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
