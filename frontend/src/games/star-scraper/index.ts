/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Why this exists: Star Scraper's catalogue entry for games/registry.ts.
 */
import type { GameEntry } from '../shared/props';
import { StarScraperGame } from './StarScraperGame';

export const starScraper: GameEntry = {
  slug: 'star-scraper',
  name: 'Star Scraper',
  emoji: '🚀',
  category: 'tomato',
  type: 'arcade',
  color: 't-w',
  how: 'Fly through the safe corridor between asteroid walls.',
  Component: StarScraperGame,
};
