/**
 * Why this exists: the plain data types every game shares. No React and no
 * DOM, so the engines can depend on this file and stay pure.
 * Drafted with an LLM (Claude Code).
 */
import type { PuzzleCategory } from '../../api/fish.api';

export type GameType = 'puzzle' | 'slash' | 'snake' | 'arcade';

/** Catalogue data shown on the dashboard. Slugs match the database Game table. */
export interface GameMeta {
  slug: string;
  name: string;
  emoji: string;
  category: PuzzleCategory;
  type: GameType;
  color: 't-b' | 't-r' | 't-w';
  how: string;
}

/** What gets saved as a Run when a game ends. */
export interface RunStats {
  score: number;
  attempts: number;
  correct: number;
  maxCombo: number;
}

export interface Point {
  x: number;
  y: number;
}

/** Floating "+30" or "CRASH!" text. */
export interface Pop extends Point {
  text: string;
  alpha: number;
}

export interface Particle extends Point {
  vx: number;
  vy: number;
  life: number;
  color: string;
  r: number;
}

/** Engines ask for sounds; the React side plays them. */
export type SoundCue =
  | { kind: 'good' }
  | { kind: 'bad' }
  | { kind: 'gold' }
  | { kind: 'slice'; combo: number };

/** Header values shown above the canvas. */
export interface Hud {
  score: number;
  combo: number;
  lives: number;
}
