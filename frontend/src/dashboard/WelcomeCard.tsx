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
import { DotText } from '../ui/DotText';
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
    <Card className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <DotText className="w-14 h-14 shrink-0 bg-b bd rounded-xl flex items-center justify-center text-3xl">
            {username[0].toUpperCase()}
          </DotText>
          <div className="min-w-0">
            <DotText as="h2" className="text-xl sm:text-3xl leading-tight break-words">
              {hello}, {username.toUpperCase()}
            </DotText>
            <p className="text-sm opacity-70">{tip}</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          {lastGame && (
            <Button variant="secondary" onClick={() => onPlay(lastGame.slug)}>
              ↻ {lastGame.name}
            </Button>
          )}
          <Button className="glow text-lg" onClick={onStart}>▶ START</Button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs font-bold mb-1">
          <DotText className="text-base">LEVEL {summary.level}</DotText>
          <span>
            {summary.xpIntoLevel} / {summary.xpForLevel} XP to level {summary.level + 1}
          </span>
        </div>
        <div className="flex gap-[3px]">
          {Array.from({ length: XP_SEGMENTS }, (_, i) => (
            <i
              key={i}
              className={`flex-1 h-4 bd rounded-sm ${i < summary.filledSegments ? 'bg-r' : 'bg-white'}`}
              style={{ animation: `fi .3s both ${i * 35}ms` }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}
