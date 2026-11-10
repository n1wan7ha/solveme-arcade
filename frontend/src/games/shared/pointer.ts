/**
 * Why this exists: converts a mouse or touch position on the (scaled) canvas
 * into game-world coordinates.
 * Ported from cp() in solveme-arcade.html.
 */
import type { PointerEvent } from 'react';
import { H, W } from './math';
import type { Point } from './types';

export function toGamePoint(event: PointerEvent<HTMLCanvasElement>): Point {
  const box = event.currentTarget.getBoundingClientRect();
  return {
    x: ((event.clientX - box.left) / box.width) * W,
    y: ((event.clientY - box.top) / box.height) * H,
  };
}

/** Horizontal position as a fraction of the canvas width, 0 to 1. */
export function toGameFraction(event: PointerEvent<HTMLCanvasElement>): number {
  const box = event.currentTarget.getBoundingClientRect();
  return (event.clientX - box.left) / box.width;
}
