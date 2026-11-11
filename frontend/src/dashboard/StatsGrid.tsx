/**
 * Why this exists: the four headline numbers under the welcome card.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { CountUp } from '../ui/CountUp';
import type { Summary } from './stats';

export function StatsGrid({ summary }: { summary: Summary }) {
  const tiles = [
    { label: 'TOTAL SCORE', value: summary.totalScore, suffix: '', color: 'neon-cyan', hint: 'All points. They fill your XP bar.' },
    { label: 'RUNS', value: summary.runCount, suffix: '', color: 'neon-yellow', hint: 'Finished rounds.' },
    { label: 'ACCURACY', value: summary.accuracy, suffix: '%', color: 'neon-pink', hint: 'Hits vs. attempts.' },
    { label: 'BEST RUN', value: summary.bestRun, suffix: '', color: 'neon-green', hint: 'Highest single score.' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {tiles.map((tile, i) => (
        <div
          key={tile.label}
          title={tile.hint}
          className="card p-3 sm:p-4"
          style={{ animation: `fi .5s both ${i * 80}ms` }}
        >
          <div className="pixel text-[0.5rem] sm:text-[0.55rem] muted">{tile.label}</div>
          <div className="hud mt-2 py-2 text-right">
            <span className={`pixel text-lg sm:text-2xl tabular-nums ${tile.color}`}>
              <CountUp to={tile.value} suffix={tile.suffix} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
