/**
 * Why this exists: the four headline numbers under the welcome card, minted
 * as arcade tokens.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import type { CSSProperties } from 'react';
import { CountUp } from '../ui/CountUp';
import type { Summary } from './stats';

const FACES: CSSProperties[] = [
  { ['--face' as string]: 'var(--white)', ['--rim' as string]: 'var(--blue)', color: 'var(--blue)' },
  { ['--face' as string]: 'var(--red)', ['--rim' as string]: 'var(--white)', color: 'var(--white)' },
  { ['--face' as string]: 'var(--white)', ['--rim' as string]: 'var(--red)', color: 'var(--red)' },
  { ['--face' as string]: 'var(--ink)', ['--rim' as string]: 'var(--white)', color: 'var(--white)' },
];

export function StatsGrid({ summary }: { summary: Summary }) {
  const tokens = [
    { label: 'TOTAL SCORE', value: summary.totalScore, suffix: '', hint: 'All points. They fill your XP bar.' },
    { label: 'RUNS', value: summary.runCount, suffix: '', hint: 'Finished rounds.' },
    { label: 'ACCURACY', value: summary.accuracy, suffix: '%', hint: 'Hits vs. attempts.' },
    { label: 'BEST RUN', value: summary.bestRun, suffix: '', hint: 'Highest single score.' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-3 py-2">
      {tokens.map((token, i) => (
        <div key={token.label} title={token.hint} className="flex flex-col items-center gap-3" style={{ animation: `fi .4s both ${i * 80}ms` }}>
          <div className="token" style={FACES[i]}>
            <span className="dot text-3xl sm:text-4xl leading-none">
              <CountUp to={token.value} suffix={token.suffix} />
            </span>
          </div>
          <span className="pixel text-[0.55rem] c-white">{token.label}</span>
        </div>
      ))}
    </div>
  );
}
