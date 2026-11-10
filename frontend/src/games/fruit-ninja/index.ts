/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Why this exists: Fruit Slash's catalogue entry for games/registry.ts.
 * The folder and slug keep the original "fruit-ninja" id used by the API.
 */
import type { GameEntry } from '../shared/props';
import { FruitSlashGame } from './FruitSlashGame';

export const fruitSlash: GameEntry = {
  slug: 'fruit-ninja',
  name: 'Fruit Slash',
  emoji: '🍉',
  category: 'smile',
  type: 'slash',
  color: 't-r',
  how: 'Swipe to slice. Easy start, gets faster. Avoid 💣. Golden 🍍 = 5x.',
  Component: FruitSlashGame,
};
