/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Why this exists: Fish Count's catalogue entry for games/registry.ts.
 */
import type { GameEntry } from '../shared/props';
import { FishCountGame } from './FishCountGame';

export const fishCount: GameEntry = {
  slug: 'fish-count',
  name: 'Fish Count',
  emoji: '🐟',
  category: 'fish',
  type: 'puzzle',
  color: 't-r',
  how: 'Type the answer. 3 wrong answers end the run.',
  Component: FishCountGame,
};
