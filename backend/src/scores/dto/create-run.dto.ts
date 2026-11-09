/**
 * Why this exists: validates a finished game before it is saved. The upper
 * limit rejects absurd values and keeps numbers inside the database's Int range.
 * Drafted with an LLM (Claude Code).
 */
import { IsDateString, IsInt, Max, Min } from 'class-validator';

const MAX_RUN_VALUE = 1_000_000;

export class CreateRunDto {
  @IsInt()
  @Min(0)
  @Max(MAX_RUN_VALUE)
  score: number;

  @IsInt()
  @Min(0)
  @Max(MAX_RUN_VALUE)
  attempts: number;

  @IsInt()
  @Min(0)
  @Max(MAX_RUN_VALUE)
  correct: number;

  @IsInt()
  @Min(0)
  @Max(MAX_RUN_VALUE)
  maxCombo: number;

  @IsDateString()
  startedAt: string;
}
