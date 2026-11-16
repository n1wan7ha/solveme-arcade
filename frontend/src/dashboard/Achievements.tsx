/**
 * Why this exists: shows the six achievements as arcade prize tickets; locked
 * ones are pale. The unlock rules live in stats.ts.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import type { Run } from '../api/games.api';
import { achievements } from './stats';
import { PixelIcon } from '../ui/PixelIcon';

export function Achievements({ runs, className = '' }: { runs: Run[]; className?: string }) {
  const list = achievements(runs);
  const unlocked = list.filter((item) => item.unlocked).length;

  return (
    <section className={className}>
      <div className="flex items-end justify-between gap-3 mb-4">
        <h3 className="panel-title">PRIZE TICKETS</h3>
        <span className="pixel text-[0.5rem] c-white">{unlocked}/{list.length} WON</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((item, i) => (
          <div
            key={item.title}
            title={item.description}
            className={`ticket ${item.unlocked ? '' : 'locked'} flex items-stretch`}
            style={{ animation: `fi .4s both ${i * 70}ms` }}
          >
            <div className="w-20 shrink-0 grid place-items-center border-r-[3px] border-dashed border-current">
              <span className="bg-[var(--white)] border-[3px] border-[var(--ink)] p-1 grid">
                <PixelIcon name={item.icon} size={32} className={item.unlocked ? '' : 'grayscale opacity-50'} />
              </span>
            </div>
            <div className="px-4 py-3 min-w-0">
              <div className="pixel text-[0.6rem]">{item.title.toUpperCase()}</div>
              <div className="text-xs mt-1.5 font-bold">{item.unlocked ? 'WON!' : item.description}</div>
            </div>
            <div className="ml-auto pr-4 self-center pixel text-[0.5rem] opacity-80 hidden sm:block">
              No.{String(i + 1).padStart(3, '0')}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
