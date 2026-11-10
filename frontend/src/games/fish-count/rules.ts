/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Refactored into pure engine + React glue for rubric theme #1
 * (low coupling: rules are plain data; high cohesion: everything that makes
 * Fish Count different lives in this one object).
 */
import type { PuzzleRules } from '../puzzle/engine';

export const RULES: PuzzleRules = { question: 'How many fish are in the picture?', lives: 3 };
