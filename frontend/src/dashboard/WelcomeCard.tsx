/**
 * Why this exists: the top card: greeting, avatar, a random tip, the START and
 * replay buttons, and the level / XP bar.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { useState } from 'react';
import type { Run } from '../api/games.api';
import { findGame } from '../games/registry';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { greeting, TIPS, XP_SEGMENTS } from './stats';
import type { Summary } from './stats';

interface WelcomeCardProps {
  username: string;
  summary: Summary;
  lastRun: Run | undefined;
  onStart: () => void;
  onPlay: (slug: string) => void;
}

export function WelcomeCard({ username, summary, lastRun, onStart, onPlay }: WelcomeCardProps) {
  // Chosen once on mount, so they stay put while the page re-renders.
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [hello] = useState(() => greeting(new Date().getHours()));
  const lastGame = findGame(lastRun?.gameId);

  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
      <div className="pointer-events-none absolute -right-10 -top-16 w-64 h-64 rounded-full bg-[#ff2e88] opacity-20 blur-3xl" aria-hidden />
      <div className="relative flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 shrink-0 rounded-xl bd bg-[#05030f] grid place-items-center pixel text-2xl neon-cyan shadow-[0_0_20px_#27e8ff44]">
            {username[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="pixel text-[0.55rem] neon-yellow blink mb-2">PLAYER 1 READY</p>
            <h2 className="pixel text-sm sm:text-xl leading-snug break-words">
              {hello}, <span className="neon-pink">{username.toUpperCase()}</span>
            </h2>
            <p className="text-sm muted mt-1">
              <span className="pixel text-[0.5rem] neon-cyan mr-2">TIP</span>
              {tip}
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {lastGame && (
            <Button variant="secondary" onClick={() => onPlay(lastGame.slug)}>
              ↻ {lastGame.name.toUpperCase()}
            </Button>
          )}
          <Button className="glow text-sm px-6" onClick={onStart}>▶ START</Button>
        </div>
      </div>

      <div className="relative mt-5">
        <div className="flex justify-between items-end mb-2 gap-2">
          <span className="pixel text-xs neon-yellow">LV {summary.level}</span>
          <span className="text-xs muted">
            {summary.xpIntoLevel} / {summary.xpForLevel} XP to level {summary.level + 1}
          </span>
        </div>
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${XP_SEGMENTS}, 1fr)` }}>
          {Array.from({ length: XP_SEGMENTS }, (_, i) => (
            <i
              key={i}
              className={`seg ${i < summary.filledSegments ? 'on' : ''}`}
              style={{ animation: `fi .3s both ${i * 35}ms` }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
