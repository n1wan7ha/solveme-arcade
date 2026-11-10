/**
 * Why this exists: the faint game emojis rising up the background.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { BACKGROUND_EMOJIS } from '../games/shared/assets';

const COUNT = 12;
const between = (min: number, max: number) => min + Math.random() * (max - min);

export function FloatingEmojis() {
  // Random positions are chosen once, so they do not jump on re-render.
  const [items] = useState(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      emoji: BACKGROUND_EMOJIS[i % BACKGROUND_EMOJIS.length],
      style: {
        left: `${between(0, 96)}%`,
        fontSize: `${between(22, 50)}px`,
        animationDuration: `${between(18, 40)}s`,
        animationDelay: `${-between(0, 30)}s`,
      } satisfies CSSProperties,
    })),
  );

  return (
    <div aria-hidden>
      {items.map((item, i) => (
        <span key={i} className="fl" style={item.style}>
          {item.emoji}
        </span>
      ))}
    </div>
  );
}
