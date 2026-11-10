/**
 * Why this exists: the levelling rule, shared by the dashboard XP bar and the
 * "LEVEL UP!" message at the end of a game.
 * Ported from lvlOf() in solveme-arcade.html.
 */

/** Level n starts at 40 × (n-1)² points, so each level takes longer. */
export const levelOf = (totalScore: number) => 1 + Math.floor(Math.sqrt(totalScore / 40));

export const levelStart = (level: number) => 40 * (level - 1) ** 2;
