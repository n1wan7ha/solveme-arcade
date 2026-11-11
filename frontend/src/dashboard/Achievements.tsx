/**
 * Why this exists: shows the six achievements, highlighting the unlocked ones.
 * The unlock rules live in stats.ts.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import type { Run } from '../api/games.api';
import { Card } from '../ui/Card';
import { achievements } from './stats';

export function Achievements({ runs, className = '' }: { runs: Run[]; className?: string }) {
  return (
    <Card className={`p-4 sm:p-5 ${className}`}>
      <h3 className="panel-title neon-green mb-4">ACHIEVEMENTS</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {achievements(runs).map((item, i) => (
          <div
            key={item.title}
            title={item.description}
            className={`rounded-xl p-3 text-center border-2 ${item.unlocked ? 'border-[var(--yellow)] bg-[#ffd23f14] shadow-[0_0_18px_#ffd23f33]' : 'border-[var(--line)] bg-[#05030f] opacity-55 grayscale'}`}
            style={{ animation: `fi .5s both ${i * 70}ms` }}
          >
            <div className={`text-3xl ${item.unlocked ? 'float' : ''}`}>{item.emoji}</div>
            <div className={`pixel text-[0.55rem] mt-2 ${item.unlocked ? 'neon-yellow' : ''}`}>{item.title.toUpperCase()}</div>
            <div className="text-[11px] muted mt-1">{item.unlocked ? 'Unlocked!' : item.description}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
