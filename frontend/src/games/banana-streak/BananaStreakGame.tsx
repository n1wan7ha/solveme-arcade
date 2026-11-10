/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Refactored into pure engine + React glue for rubric theme #1: this component
 * only passes Banana Streak's rules to the shared puzzle game.
 */
import { PuzzleGame } from '../puzzle/PuzzleGame';
import type { GameProps } from '../shared/props';
import { RULES } from './rules';

export function BananaStreakGame(props: GameProps) {
  return <PuzzleGame {...props} rules={RULES} />;
}
