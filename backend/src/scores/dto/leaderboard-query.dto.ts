/**
 * Why this exists: gameId becomes part of a cache key, so it is limited to the
 * slug format. Leaving it out means the all-games leaderboard.
 * Drafted with an LLM (Claude Code).
 */
import { IsOptional, Matches } from 'class-validator';

export class LeaderboardQueryDto {
  @IsOptional()
  @Matches(/^[a-z0-9-]{1,40}$/, { message: 'gameId must be a game slug' })
  gameId: string = 'all';
}
