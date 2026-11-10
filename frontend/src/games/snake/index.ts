/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Why this exists: Snake's catalogue entry for games/registry.ts.
 */
import type { GameEntry } from '../shared/props';
import { SnakeGame } from './SnakeGame';

export const snake: GameEntry = {
  slug: 'snake',
  name: 'Snake',
  emoji: '🐍',
  category: 'banana',
  type: 'snake',
  color: 't-b',
  how: 'Eat to grow. Starts slow, speeds up. Hidden answer makes some food a 3x bonus.',
  Component: SnakeGame,
};
