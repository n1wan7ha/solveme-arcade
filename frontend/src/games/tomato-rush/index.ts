/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Why this exists: Tomato Rush's catalogue entry for games/registry.ts.
 */
import type { GameEntry } from '../shared/props';
import { TomatoRushGame } from './TomatoRushGame';

export const tomatoRush: GameEntry = {
  slug: 'tomato-rush',
  name: 'Tomato Rush',
  emoji: '🍅',
  category: 'tomato',
  type: 'puzzle',
  color: 't-w',
  how: '60 seconds. Skip hard ones. Each correct answer is +10.',
  Component: TomatoRushGame,
};
