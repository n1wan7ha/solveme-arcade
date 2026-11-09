/**
 * Why this exists: the category becomes part of an outgoing URL, so only known
 * values are allowed. Users can never steer the request somewhere else.
 * Drafted with an LLM (Claude Code).
 */
import { IsIn } from 'class-validator';

export const FISH_CATEGORIES = ['fish', 'banana', 'tomato', 'smile'] as const;
export type FishCategory = (typeof FISH_CATEGORIES)[number];

export class PuzzleQueryDto {
  @IsIn(FISH_CATEGORIES)
  category: FishCategory;
}
