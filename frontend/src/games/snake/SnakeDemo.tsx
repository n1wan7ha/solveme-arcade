/**
 * Why this exists: attract mode for the login screen. The real Snake engine
 * and renderer, steered by a small autopilot, with no sound and no saving.
 * When the demo snake dies, a fresh one starts.
 * Drafted with an LLM (Claude Code).
 */
import { useRef, useState } from 'react';
import type { AnswerSource } from '../shared/answers';
import { H, SCALE, W } from '../shared/math';
import { useGameLoop } from '../shared/useGameLoop';
import type { Point } from '../shared/types';
import { COLS, ROWS, SnakeEngine } from './engine';
import { drawSnake } from './renderer';

// The demo never calls the puzzle service; any digit will do.
const RANDOM_ANSWERS: AnswerSource = { take: () => Math.floor(Math.random() * 10) };

const key = (p: Point) => p.y * COLS + p.x;
const inside = (p: Point) => p.x >= 0 && p.y >= 0 && p.x < COLS && p.y < ROWS;

/** How many free cells can be reached from `start`: avoids turning into a dead end. */
function roomFrom(start: Point, blocked: Set<number>, limit: number): number {
  const seen = new Set([key(start)]);
  const queue = [start];
  while (queue.length && seen.size < limit) {
    const p = queue.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = { x: p.x + dx, y: p.y + dy };
      if (inside(n) && !blocked.has(key(n)) && !seen.has(key(n))) {
        seen.add(key(n));
        queue.push(n);
      }
    }
  }
  return seen.size;
}

/** Picks the safe direction with the most room, then the one closest to the food. */
function steer(engine: SnakeEngine): void {
  const { snake, direction, food } = engine.state;
  const head = snake[0];
  const blocked = new Set(snake.slice(0, -1).map(key));
  const options = [direction, { x: direction.y, y: -direction.x }, { x: -direction.y, y: direction.x }];

  const scored = options
    .map((dir) => {
      const next = { x: head.x + dir.x, y: head.y + dir.y };
      if (!inside(next) || blocked.has(key(next))) return null;
      const room = roomFrom(next, blocked, snake.length * 2);
      const distance = Math.abs(next.x - food.x) + Math.abs(next.y - food.y);
      return { dir, safe: room >= Math.min(snake.length * 2, 40), distance };
    })
    .filter((option) => option !== null)
    .sort((a, b) => Number(b.safe) - Number(a.safe) || a.distance - b.distance);

  const best = scored[0]?.dir;
  if (best && (best.x !== direction.x || best.y !== direction.y)) engine.turn(best.x, best.y);
}

export function SnakeDemo({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState(() => new SnakeEngine(RANDOM_ANSWERS));
  const lastHead = useRef(-1);

  useGameLoop(canvasRef, engine, drawSnake, () => {
    engine.drainSounds(); // the demo is silent
    if (engine.state.over) {
      setEngine(new SnakeEngine(RANDOM_ANSWERS));
      return;
    }
    const head = key(engine.state.snake[0]);
    if (head !== lastHead.current && engine.state.queuedTurns.length === 0) {
      lastHead.current = head;
      steer(engine);
    }
  });

  return (
    <div className={`screen crt relative ${className}`}>
      <canvas ref={canvasRef} width={W * SCALE} height={H * SCALE} className="block w-full" style={{ aspectRatio: '7 / 10' }} aria-hidden />
      <div className="absolute inset-x-0 top-6 z-[3] flex justify-center pointer-events-none">
        <span className="pixel text-[0.6rem] bg-[var(--ink)] c-white px-3 py-2">DEMO PLAY</span>
      </div>
      <div className="absolute inset-x-0 bottom-10 z-[3] flex justify-center pointer-events-none">
        <span className="pixel text-xs bg-[var(--red)] c-white border-[3px] border-[var(--ink)] px-3 py-2 blink">INSERT COIN</span>
      </div>
    </div>
  );
}
