/**
 * Why this exists: validates the three letters a player signs the high-score
 * table with, like an arcade machine (A-Z only).
 * Drafted with an LLM (Claude Code).
 */
import { Matches } from 'class-validator';

export class UpdateInitialsDto {
  @Matches(/^[A-Z]{3}$/, { message: 'initials must be three capital letters' })
  initials: string;
}
