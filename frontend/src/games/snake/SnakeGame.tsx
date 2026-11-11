/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Refactored into pure engine + renderer + React glue for rubric theme #1.
 *
 * Why this exists: React glue only. It creates the engine and turns keys,
 * swipes and D-pad presses into engine.turn() calls.
 */
import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { ActionGameShell } from '../shared/ActionGameShell';
import { toGamePoint } from '../shared/pointer';
import type { GameProps } from '../shared/props';
import type { Point } from '../shared/types';
import { useAnswerQueue } from '../shared/useAnswerQueue';
import { SnakeEngine } from './engine';
import { drawSnake } from './renderer';

const KEY_DIRECTIONS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0], a: [-1, 0],
  ArrowRight: [1, 0], d: [1, 0],
  ArrowUp: [0, -1], w: [0, -1],
  ArrowDown: [0, 1], s: [0, 1],
};
const SWIPE_DISTANCE = 22; // game units before a drag counts as a swipe
const DPAD: { label: string; dir: [number, number]; area: string }[] = [
  { label: '▲', dir: [0, -1], area: 'col-start-2' },
  { label: '◀', dir: [-1, 0], area: 'col-start-1' },
  { label: '▼', dir: [0, 1], area: '' },
  { label: '▶', dir: [1, 0], area: '' },
];

export function SnakeGame(props: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const answers = useAnswerQueue(props.meta.category);
  const [engine] = useState(() => new SnakeEngine(answers));
  const swipeStart = useRef<Point | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const dir = KEY_DIRECTIONS[event.key];
      if (!dir) return;
      event.preventDefault(); // stop the arrow keys scrolling the page
      engine.turn(...dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [engine]);

  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const start = swipeStart.current;
    if (!start) return;
    const p = toGamePoint(event);
    const dx = p.x - start.x;
    const dy = p.y - start.y;
    if (Math.hypot(dx, dy) <= SWIPE_DISTANCE) return;
    if (Math.abs(dx) > Math.abs(dy)) engine.turn(Math.sign(dx), 0);
    else engine.turn(0, Math.sign(dy));
    swipeStart.current = p;
  };

  return (
    <ActionGameShell
      {...props}
      engine={engine}
      draw={drawSnake}
      canvasRef={canvasRef}
      controls="Arrow keys / WASD, swipe the board or use the pad. Do not hit walls or yourself. P to pause."
      canvasProps={{
        onPointerDown: (e) => { swipeStart.current = toGamePoint(e); },
        onPointerMove,
        onPointerUp: () => { swipeStart.current = null; },
      }}
    >
      <div className="grid grid-cols-3 gap-2 w-[172px] select-none">
        {DPAD.map(({ label, dir, area }) => (
          <button
            key={label}
            type="button"
            className={`arcade-btn justify-self-center ${area}`}
            style={{ ['--btn' as string]: dir[1] ? 'var(--pink)' : 'var(--cyan)' }}
            aria-label={`Turn ${label}`}
            onPointerDown={(e) => { e.preventDefault(); engine.turn(...dir); }}
          >
            {label}
          </button>
        ))}
      </div>
    </ActionGameShell>
  );
}
