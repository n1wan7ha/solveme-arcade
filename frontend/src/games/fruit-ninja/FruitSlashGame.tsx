/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Refactored into pure engine + renderer + React glue for rubric theme #1.
 *
 * Why this exists: React glue only. It turns mouse or touch drags on the
 * canvas into swipe calls on the engine.
 */
import { useRef, useState } from 'react';
import { ActionGameShell } from '../shared/ActionGameShell';
import { toGamePoint } from '../shared/pointer';
import type { GameProps } from '../shared/props';
import { useAnswerQueue } from '../shared/useAnswerQueue';
import { FruitSlashEngine } from './engine';
import { drawFruitSlash } from './renderer';

export function FruitSlashGame(props: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const answers = useAnswerQueue(props.meta.category);
  const [engine] = useState(() => new FruitSlashEngine(answers));

  return (
    <ActionGameShell
      {...props}
      engine={engine}
      draw={drawFruitSlash}
      canvasRef={canvasRef}
      controls="Drag / swipe across fruit to slice it. Avoid bombs 💣. Golden 🍍 = 5x points. P to pause."
      canvasProps={{
        onPointerDown: (e) => {
          e.currentTarget.setPointerCapture(e.pointerId); // keep the swipe if it leaves the canvas
          engine.startSwipe(toGamePoint(e));
        },
        onPointerMove: (e) => engine.moveSwipe(toGamePoint(e)),
        onPointerUp: () => engine.endSwipe(),
        onPointerLeave: () => engine.endSwipe(),
      }}
    />
  );
}
