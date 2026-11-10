/**
 * Why this exists: the bar above every game: exit, title and rules, score,
 * lives, combo, and the mute and pause buttons.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { DotText } from '../../ui/DotText';
import { isMuted, toggleMute } from './audio';
import type { GameMeta } from './types';

interface GameHeaderProps {
  meta: GameMeta;
  score: number;
  livesLabel: string;
  comboLabel: string;
  onExit: () => void;
  onPause?: () => void;
}

export function GameHeader({ meta, score, livesLabel, comboLabel, onExit, onPause }: GameHeaderProps) {
  const [muted, setMuted] = useState(isMuted);

  return (
    <Card className="w-full max-w-4xl p-2 sm:p-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Button variant="secondary" className="px-3 py-1.5 text-sm" onClick={onExit}>⟵ EXIT</Button>
        <div className="min-w-0">
          <DotText as="h2" className="text-lg sm:text-xl leading-tight">{meta.emoji} {meta.name}</DotText>
          <p className="text-xs opacity-70 hidden md:block max-w-md">{meta.how}</p>
        </div>
      </div>
      <div className="flex gap-3 sm:gap-5 items-center text-right">
        <div>
          <div className="lab mb-0 opacity-60">Score</div>
          <DotText className="text-2xl tx-b leading-none">{score}</DotText>
        </div>
        <div>
          <div className="lab mb-0 opacity-60">Lives</div>
          <div className="text-xl leading-none tx-r font-bold">{livesLabel}</div>
        </div>
        <div>
          <div className="lab mb-0 opacity-60">Combo</div>
          <DotText className="text-2xl leading-none">{comboLabel}</DotText>
        </div>
        <Button variant="secondary" className="px-3 py-1" aria-label="Sound" onClick={() => setMuted(toggleMute())}>
          {muted ? '🔇' : '🔊'}
        </Button>
        {onPause && (
          <Button variant="secondary" className="px-3 py-1" aria-label="Pause" onClick={onPause}>⏸</Button>
        )}
      </div>
    </Card>
  );
}
