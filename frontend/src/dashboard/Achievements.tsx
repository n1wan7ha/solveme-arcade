/**
 * Why this exists: shows the six achievements, highlighting the unlocked ones.
 * The unlock rules live in stats.ts.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import type { Run } from '../api/games.api';
import { Card } from '../ui/Card';
import { DotText } from '../ui/DotText';
import { achievements } from './stats';

export function Achievements({ runs, className = '' }: { runs: Run[]; className?: string }) {
  return (
    <Card className={`p-4 sm:p-5 ${className}`}>
      <DotText as="h3" className="text-xl mb-3 block">ACHIEVEMENTS</DotText>
      <div className="grid grid-cols-2 gap-3">
        {achievements(runs).map((item, i) => (
          <div
            key={item.title}
            title={item.description}
            className={`bd rounded-xl p-3 text-center ${item.unlocked ? 'bg-r' : 'bg-white opacity-50'}`}
            style={{ animation: `fi .5s both ${i * 70}ms` }}
          >
            <div className={`text-3xl ${item.unlocked ? 'float' : ''}`}>{item.emoji}</div>
            <div className="text-sm font-bold">{item.title}</div>
            <div className="text-[11px] opacity-80">{item.unlocked ? 'Unlocked!' : item.description}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
