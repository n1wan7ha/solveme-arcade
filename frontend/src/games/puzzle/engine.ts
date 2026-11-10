/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Refactored into pure engine + React glue for rubric theme #1
 * (low coupling: the engine knows nothing about React, images or HTTP;
 * high cohesion: every puzzle scoring rule lives here).
 *
 * The four puzzle games differ only in their rules (lives, streak, timer or
 * rounds), so they share this one engine instead of four copies.
 */
import type { RunStats } from '../shared/types';

export interface PuzzleRules {
  question: string;
  lives?: number; // wrong answers allowed before the run ends
  streak?: boolean; // consecutive correct answers multiply points, up to x5
  timeLimit?: number; // seconds
  rounds?: number; // number of answers before the run ends
  hintCost?: number; // points a hint costs
}

export interface PuzzleState {
  score: number;
  streak: number;
  maxCombo: number;
  correct: number;
  attempts: number;
  lives: number;
  timeLeft: number;
  over: boolean;
  solution: number | null; // null while the next puzzle loads
}

export type AnswerOutcome = 'correct' | 'wrong' | 'ignored';

const POINTS = 10;
const MAX_MULTIPLIER = 5;

export class PuzzleEngine {
  readonly rules: PuzzleRules;
  readonly state: PuzzleState;

  constructor(rules: PuzzleRules) {
    this.rules = rules;
    this.state = {
      score: 0, streak: 0, maxCombo: 1, correct: 0, attempts: 0,
      lives: rules.lives ?? 0, timeLeft: rules.timeLimit ?? 0,
      over: false, solution: null,
    };
  }

  setSolution(solution: number | null): void {
    this.state.solution = solution;
  }

  answer(value: number): AnswerOutcome {
    const s = this.state;
    if (Number.isNaN(value) || s.solution === null || s.over) return 'ignored';

    s.attempts++;
    const isCorrect = value === s.solution;
    if (isCorrect) {
      s.correct++;
      s.streak++;
      s.maxCombo = Math.max(s.maxCombo, s.streak);
      s.score += POINTS * (this.rules.streak ? Math.min(s.streak, MAX_MULTIPLIER) : 1);
    } else {
      s.streak = 0;
      if (this.rules.lives) s.lives--;
    }

    const outOfLives = this.rules.lives !== undefined && s.lives <= 0;
    const outOfRounds = this.rules.rounds !== undefined && s.attempts >= this.rules.rounds;
    if (outOfLives || outOfRounds) s.over = true;

    return isCorrect ? 'correct' : 'wrong';
  }

  /** Called once a second by the timed game. */
  tick(): void {
    const s = this.state;
    if (s.over || !this.rules.timeLimit) return;
    s.timeLeft--;
    if (s.timeLeft <= 0) s.over = true;
  }

  /** Costs points; narrows the answer to a range of five. */
  takeHint(): string | null {
    const s = this.state;
    if (!this.rules.hintCost || s.solution === null || s.over) return null;
    s.score = Math.max(0, s.score - this.rules.hintCost);
    const sol = s.solution;
    return `Hint: the answer is ${sol % 2 ? 'odd' : 'even'} and between ${Math.max(0, sol - 2)} and ${sol + 2}.`;
  }

  comboLabel(): string {
    return `x${this.rules.streak ? Math.min(this.state.streak + 1, MAX_MULTIPLIER) : 1}`;
  }

  /** The "Lives" box: hearts, seconds left, rounds played, or correct count. */
  statusLabel(): string {
    const { rules, state: s } = this;
    if (rules.lives) return '♥'.repeat(Math.max(0, s.lives));
    if (rules.timeLimit) return `${Math.max(0, s.timeLeft)}s`;
    if (rules.rounds) return `${s.attempts}/${rules.rounds}`;
    return `${s.correct} ✓`;
  }

  /** How full the progress bar is, 0 to 1. */
  progress(): number {
    const { rules, state: s } = this;
    if (rules.lives) return s.lives / rules.lives;
    if (rules.timeLimit) return s.timeLeft / rules.timeLimit;
    if (rules.rounds) return 1 - s.attempts / rules.rounds;
    return Math.min(s.streak, MAX_MULTIPLIER) / MAX_MULTIPLIER;
  }

  stats(): RunStats {
    const { score, attempts, correct, maxCombo } = this.state;
    return { score, attempts, correct, maxCombo };
  }
}
