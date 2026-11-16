/**
 * Why this exists: the top card: player badge, greeting, a random tip, the
 * START and replay buttons, and the level / XP bar.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { useState } from 'react';
import type { Run } from '../api/games.api';
import { findGame } from '../games/registry';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { greeting, TIPS, XP_SEGMENTS } from './stats';
import type { Summary } from './stats';
import { PixelIcon } from '../ui/PixelIcon';

interface WelcomeCardProps {
  username: string;
  initials: string | null | undefined;
  summary: Summary;
  lastRun: Run | undefined;
  onStart: () => void;
  onPlay: (slug: string) => void;
}

export function WelcomeCard({ username, initials, summary, lastRun, onStart, onPlay }: WelcomeCardProps) {
  // Chosen once on mount, so they stay put while the page re-renders.
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [hello] = useState(() => greeting(new Date().getHours()));
  const lastGame = findGame(lastRun?.gameId);

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-5 justify-between">
        <div className="flex items-center gap-4 min-w-0">
          {/* Player badge: initials if signed, else the first letter */}
          <div className="shrink-0 w-[72px] h-[72px] bg-[var(--blue)] border-4 border-[var(--ink)] grid place-items-center pixel c-white text-lg">
            {initials ?? username[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="pixel text-[0.5rem] c-red">PLAYER 1 · LV {summary.level}</p>
            <h2 className="pixel text-sm sm:text-xl leading-snug break-words mt-2">
              {hello}, <span className="c-blue">{username.toUpperCase()}</span>
            </h2>
            <p className="text-sm mt-1.5">
              <span className="pixel text-[0.45rem] bg-[var(--ink)] c-white px-1.5 py-1 mr-2 align-middle">TIP</span>
              {tip}
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {lastGame && (
            <Button variant="secondary" onClick={() => onPlay(lastGame.slug)}>
              <PixelIcon name="replay" className="mr-2" />{lastGame.name.toUpperCase()}
            </Button>
          )}
          <Button className="glow text-sm px-6" onClick={onStart}><PixelIcon name="play" className="mr-2" />START</Button>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex justify-between items-end mb-2 gap-2">
          <span className="pixel text-[0.6rem]">XP</span>
          <span className="text-xs font-bold">
            {summary.xpIntoLevel} / {summary.xpForLevel} to level {summary.level + 1}
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
