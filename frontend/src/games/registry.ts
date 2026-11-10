/**
 * Why this exists: the catalogue of all 7 games, in the prototype's order.
 * Each game folder exports its own entry, so adding a game means adding one
 * folder and one line here. Slugs match the Game table in the database.
 * Drafted with an LLM (Claude Code).
 */
import { bananaStreak } from './banana-streak';
import { fishCount } from './fish-count';
import { fruitSlash } from './fruit-ninja';
import type { GameEntry } from './shared/props';
import { smileCove } from './smile-cove';
import { snake } from './snake';
import { starScraper } from './star-scraper';
import { tomatoRush } from './tomato-rush';

export type { GameMeta, GameType } from './shared/types';

export const GAMES: GameEntry[] = [
  snake,
  fruitSlash,
  starScraper,
  fishCount,
  bananaStreak,
  tomatoRush,
  smileCove,
];

const BY_SLUG = new Map(GAMES.map((game) => [game.slug, game]));

export function findGame(slug: string | undefined): GameEntry | undefined {
  return slug ? BY_SLUG.get(slug) : undefined;
}
