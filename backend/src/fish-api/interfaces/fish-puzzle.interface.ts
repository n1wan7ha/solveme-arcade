/**
 * Why this exists: our own description of a puzzle, so the rest of the app
 * never depends on the third party's CSV format.
 * Drafted with an LLM (Claude Code).
 */
export interface FishPuzzle {
  /** The correct answer, 0-9. */
  sol: number;
  /** The puzzle PNG as base64, without a "data:image/png;base64," prefix. */
  image: string;
}
