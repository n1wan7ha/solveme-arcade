/**
 * Why this exists: every number on the dashboard (level, XP, accuracy, best
 * run, achievements) worked out from a list of runs. Pure functions with no
 * React, so the rules are easy to read and test.
 * Ported from dash() in solveme-arcade.html.
 */
import type { Run } from '../api/games.api';
import { GAMES } from '../games/registry';

export const XP_SEGMENTS = 20;

/** Level n starts at 40 × (n-1)² points, so each level takes longer. */
export const levelOf = (totalScore: number) => 1 + Math.floor(Math.sqrt(totalScore / 40));
const levelStart = (level: number) => 40 * (level - 1) ** 2;

export interface Summary {
  totalScore: number;
  runCount: number;
  accuracy: number; // 0-100
  bestRun: number;
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
  filledSegments: number;
}

export function summarise(runs: Run[]): Summary {
  const totalScore = runs.reduce((sum, run) => sum + run.score, 0);
  const attempts = runs.reduce((sum, run) => sum + run.attempts, 0);
  const correct = runs.reduce((sum, run) => sum + run.correct, 0);
  const level = levelOf(totalScore);
  const xpIntoLevel = totalScore - levelStart(level);
  const xpForLevel = levelStart(level + 1) - levelStart(level);

  return {
    totalScore,
    runCount: runs.length,
    accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
    bestRun: Math.max(0, ...runs.map((run) => run.score)),
    level,
    xpIntoLevel,
    xpForLevel,
    filledSegments: Math.round((xpIntoLevel / xpForLevel) * XP_SEGMENTS),
  };
}

export interface Achievement {
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export function achievements(runs: Run[]): Achievement[] {
  const { bestRun, runCount } = summarise(runs);
  const attempts = runs.reduce((sum, run) => sum + run.attempts, 0);
  const correct = runs.reduce((sum, run) => sum + run.correct, 0);
  const gamesPlayed = new Set(runs.map((run) => run.gameId)).size;

  return [
    { emoji: '🏁', title: 'First run', description: 'Finish any run', unlocked: runCount >= 1 },
    { emoji: '💯', title: 'Century', description: 'Score 100+ in one run', unlocked: bestRun >= 100 },
    { emoji: '🔥', title: 'Combo x5', description: 'Reach a x5 combo', unlocked: runs.some((run) => run.maxCombo >= 5) },
    { emoji: '🎮', title: 'Collector', description: `Play all ${GAMES.length} games`, unlocked: gamesPlayed >= GAMES.length },
    { emoji: '🎯', title: 'Sharpshooter', description: '90%+ over 10 tries', unlocked: attempts >= 10 && correct / attempts >= 0.9 },
    { emoji: '🏆', title: 'Grinder', description: 'Finish 10 runs', unlocked: runCount >= 10 },
  ];
}

export function greeting(hour: number): string {
  if (hour < 12) return 'GOOD MORNING';
  if (hour < 18) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
}

export const TIPS = [
  'Snake: chain food within 5 seconds for a x5 combo.',
  'Fruit Slash: the golden 🍍 is worth 5x.',
  'Star Scraper: stay calm, the speed rises slowly.',
  'Smile Cove: a hint costs 3 points.',
  'Press P to pause any action game.',
];
