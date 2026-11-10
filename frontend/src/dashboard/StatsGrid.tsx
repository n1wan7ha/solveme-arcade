/**
 * Why this exists: the four headline numbers under the welcome card.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { CountUp } from '../ui/CountUp';
import type { Summary } from './stats';

export function StatsGrid({ summary }: { summary: Summary }) {
  const tiles = [
    { label: 'TOTAL SCORE', value: summary.totalScore, suffix: '', color: 't-b', hint: 'All points. They fill your XP bar.' },
    { label: 'RUNS', value: summary.runCount, suffix: '', color: 't-w', hint: 'Finished rounds.' },
    { label: 'ACCURACY', value: summary.accuracy, suffix: '%', color: 't-r', hint: 'Hits vs. attempts.' },
    { label: 'BEST RUN', value: summary.bestRun, suffix: '', color: 't-w', hint: 'Highest single score.' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {tiles.map((tile, i) => (
        <div
          key={tile.label}
          title={tile.hint}
          className={`tile ${tile.color} p-3 sm:p-4`}
          style={{ animation: `fi .5s both ${i * 80}ms` }}
        >
          <div className="text-[10px] sm:text-xs font-bold tracking-widest opacity-80">{tile.label}</div>
          <div className="dot text-3xl sm:text-4xl">
            <CountUp to={tile.value} suffix={tile.suffix} />
          </div>
        </div>
      ))}
    </div>
  );
}
