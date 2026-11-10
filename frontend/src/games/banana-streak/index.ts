/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Why this exists: Banana Streak's catalogue entry for games/registry.ts.
 */
import type { GameEntry } from '../shared/props';
import { BananaStreakGame } from './BananaStreakGame';

export const bananaStreak: GameEntry = {
  slug: 'banana-streak',
  name: 'Banana Streak',
  emoji: '🍌',
  category: 'banana',
  type: 'puzzle',
  color: 't-b',
  how: 'Chain right answers for up to x5. A wrong one resets it.',
  Component: BananaStreakGame,
};
