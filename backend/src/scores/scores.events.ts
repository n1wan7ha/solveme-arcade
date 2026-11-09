/**
 * Why this exists: the names and payloads of the internal domain events. The
 * scores feature announces what happened; it does not know who is listening.
 * Drafted with an LLM (Claude Code).
 */
import type { Run } from '@prisma/client';
import type { LeaderboardEntry } from './interfaces/leaderboard-entry.interface.js';

export const ALL_GAMES = 'all';

export const RUN_CREATED = 'run.created';
export const LEADERBOARD_UPDATED = 'leaderboard.updated';

export interface RunCreatedEvent {
  run: Run;
  username: string;
}

export interface LeaderboardUpdatedEvent {
  gameId: string; // a game slug, or "all"
  leaderboard: LeaderboardEntry[];
}
