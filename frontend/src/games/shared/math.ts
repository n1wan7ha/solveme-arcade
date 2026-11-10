/**
 * Why this exists: the game world's size and two small number helpers.
 * Ported from solveme-arcade.html (student's original prototype).
 */

/** Game world size in game units. The canvas is SCALE times larger for sharpness. */
export const W = 420;
export const H = 600;
export const SCALE = 2;

/** A random number from min (inclusive) to max (exclusive). */
export const between = (min: number, max: number) => min + Math.random() * (max - min);

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
