/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Why this exists: Smile Cove's catalogue entry for games/registry.ts.
 */
import type { GameEntry } from '../shared/props';
import { SmileCoveGame } from './SmileCoveGame';

export const smileCove: GameEntry = {
  slug: 'smile-cove',
  name: 'Smile Cove',
  emoji: '😀',
  category: 'smile',
  type: 'puzzle',
  color: 't-r',
  how: '10 puzzles. Hints cost 3 points.',
  Component: SmileCoveGame,
};
