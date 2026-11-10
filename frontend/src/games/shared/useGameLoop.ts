/**
 * Why this exists: the heartbeat of every action game. Each animation frame it
 * calls engine.step(dt), then the renderer's draw(ctx, state). The engine and
 * renderer never call each other.
 * Ported from loop() in solveme-arcade.html; hook drafted with an LLM (Claude Code).
 */
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { SCALE } from './math';

const MAX_DT = 0.05; // a slow frame never jumps the game more than 50 ms

interface Steppable<S> {
  readonly state: S;
  step(dt: number): void;
}

export function useGameLoop<S>(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  engine: Steppable<S>,
  draw: (ctx: CanvasRenderingContext2D, state: S) => void,
  onFrame: () => void,
): void {
  // Keeps the latest callback without restarting the loop on each render.
  const onFrameRef = useRef(onFrame);
  useEffect(() => {
    onFrameRef.current = onFrame;
  });

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(MAX_DT, (now - last) / 1000);
      last = now;
      engine.step(dt);
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0); // draw in game units
      draw(ctx, engine.state);
      onFrameRef.current();
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [canvasRef, engine, draw]);
}
