/**
 * Why this exists: artwork and emoji sets shared by the games, moved out of
 * the prototype's single script.
 * Ported from solveme-arcade.html (student's original prototype).
 */

/** Pixel-style ship sprite for Star Scraper. */
export const SHIP_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100"><path d="M20 52L3 80v11l17-8zM40 52l17 28v11l-17-8z" fill="#6366f1"/><path d="M30 2c8 10 11 26 11 44v28H19V46C19 28 22 12 30 2z" fill="#e2e8f0"/><path d="M30 2c3 4 5 9 6 15H24c1-6 3-11 6-15z" fill="#f43f5e"/><circle cx="30" cy="34" r="6" fill="#38bdf8"/><circle cx="28" cy="32" r="2" fill="#fff" opacity=".7"/><rect x="22" y="72" width="16" height="13" rx="3" fill="#475569"/><rect x="26" y="50" width="8" height="14" rx="2" fill="#94a3b8"/></svg>`;

/** Turns an SVG string into something an <img> or Image() can load. */
export const svgDataUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

/** Fruit for Fruit Slash, with the juice colour each one splashes. */
export const FRUIT_JUICE: Record<string, string> = {
  '🍉': '#fb7185',
  '🍊': '#fb923c',
  '🍎': '#ef4444',
  '🍌': '#fde047',
  '🍇': '#a855f7',
  '🍓': '#f43f5e',
  '🥝': '#84cc16',
  '🍑': '#fdba74',
};
export const FRUITS = Object.keys(FRUIT_JUICE);
export const GOLDEN_FRUIT = '🍍';
export const BOMB = '💣';

/** The emojis drifting up the page background. */
export const BACKGROUND_EMOJIS = ['🐍', '🍉', '🚀', '🐟', '🍌', '🍅', '😀'];
