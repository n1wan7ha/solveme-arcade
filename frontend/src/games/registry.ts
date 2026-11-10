/**
 * Why this exists: the catalogue of the 7 games and how each one looks on the
 * dashboard. Slugs match the Game table in the database. Module 6 adds each
 * game's component here.
 * Ported from the GAMES object in solveme-arcade.html.
 */
import type { PuzzleCategory } from '../api/fish.api';

export type GameType = 'puzzle' | 'slash' | 'snake' | 'arcade';

export interface GameMeta {
  slug: string;
  name: string;
  emoji: string;
  category: PuzzleCategory;
  type: GameType;
  color: 't-b' | 't-r' | 't-w';
  how: string;
}

export const GAMES: GameMeta[] = [
  { slug: 'snake', name: 'Snake', emoji: '🐍', category: 'banana', type: 'snake', color: 't-b',
    how: 'Eat to grow. Starts slow, speeds up. Hidden answer makes some food a 3x bonus.' },
  { slug: 'fruit-ninja', name: 'Fruit Slash', emoji: '🍉', category: 'smile', type: 'slash', color: 't-r',
    how: 'Swipe to slice. Easy start, gets faster. Avoid 💣. Golden 🍍 = 5x.' },
  { slug: 'star-scraper', name: 'Star Scraper', emoji: '🚀', category: 'tomato', type: 'arcade', color: 't-w',
    how: 'Fly through the safe corridor between asteroid walls.' },
  { slug: 'fish-count', name: 'Fish Count', emoji: '🐟', category: 'fish', type: 'puzzle', color: 't-r',
    how: 'Type the answer. 3 wrong answers end the run.' },
  { slug: 'banana-streak', name: 'Banana Streak', emoji: '🍌', category: 'banana', type: 'puzzle', color: 't-b',
    how: 'Chain right answers for up to x5. A wrong one resets it.' },
  { slug: 'tomato-rush', name: 'Tomato Rush', emoji: '🍅', category: 'tomato', type: 'puzzle', color: 't-w',
    how: '60 seconds. Skip hard ones. Each correct answer is +10.' },
  { slug: 'smile-cove', name: 'Smile Cove', emoji: '😀', category: 'smile', type: 'puzzle', color: 't-r',
    how: '10 puzzles. Hints cost 3 points.' },
];

const BY_SLUG = new Map(GAMES.map((game) => [game.slug, game]));

export function findGame(slug: string | undefined): GameMeta | undefined {
  return slug ? BY_SLUG.get(slug) : undefined;
}
