/**
 * Why this exists: the bar chart of the last 12 runs and the 4 most recent
 * runs as an activity log.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import type { Run } from '../api/games.api';
import { findGame } from '../games/registry';
import { Card } from '../ui/Card';

const CHART_RUNS = 12;
const LOG_RUNS = 4;

export function RunHistory({ runs, className = '' }: { runs: Run[]; className?: string }) {
  const chartRuns = runs.slice(0, CHART_RUNS).reverse(); // oldest on the left
  const tallest = Math.max(10, ...chartRuns.map((run) => run.score));

  return (
    <Card className={`p-4 sm:p-5 ${className}`}>
      <h3 className="panel-title neon-cyan">LAST 12 RUNS</h3>
      <p className="text-xs muted mt-2 mb-3">Cyan = action games, pink = puzzles. Hover for details.</p>
      <div className="hud flex items-end gap-1.5 h-36 bg-[repeating-linear-gradient(0deg,#ffffff0a_0_1px,transparent_1px_24px)]">
        {chartRuns.length === 0 && (
          <p className="text-sm muted self-center">Play a game to see your progress.</p>
        )}
        {chartRuns.map((run, i) => {
          const game = findGame(run.gameId)!;
          return (
            <div
              key={run.id}
              title={`${game.name}: ${run.score}`}
              className={`flex-1 rounded-t-sm hover:brightness-125 ${game.type === 'puzzle' ? 'bg-[var(--pink)] shadow-[0_0_10px_#ff2e8888]' : 'bg-[var(--cyan)] shadow-[0_0_10px_#27e8ff88]'}`}
              style={{
                height: `${Math.max(4, (run.score / tallest) * 100)}%`,
                transformOrigin: 'bottom',
                animation: `grow .6s both ${i * 50}ms`,
              }}
            />
          );
        })}
      </div>

      <h4 className="lab mt-5">Activity log</h4>
      <div className="space-y-2 text-sm">
        {runs.slice(0, LOG_RUNS).map((run) => {
          const game = findGame(run.gameId)!;
          return (
            <div key={run.id} className="flex justify-between bd rounded-lg px-3 py-1.5 bg-[#05030f]">
              <span>{game.emoji} {game.name}</span>
              <b className="pixel text-xs neon-green self-center">{run.score}</b>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
