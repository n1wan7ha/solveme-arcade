/**
 * Why this exists: typed wrappers for games, runs and leaderboards. Scores are
 * saved here, in PostgreSQL through the backend, not in localStorage.
 * Drafted with an LLM (Claude Code).
 */
import { http } from './http';

export interface Run {
  id: string;
  userId: string;
  gameId: string;
  score: number;
  attempts: number;
  correct: number;
  maxCombo: number;
  startedAt: string;
  finishedAt: string;
}

export type NewRun = Pick<Run, 'score' | 'attempts' | 'correct' | 'maxCombo' | 'startedAt'>;

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

/** "all" ranks total points across every game. */
export type LeaderboardScope = string | 'all';

export const gamesApi = {
  createRun: (gameId: string, run: NewRun) =>
    http.post<Run>(`/games/${gameId}/runs`, run).then((res) => res.data),

  myRuns: () => http.get<Run[]>('/me/runs').then((res) => res.data),

  leaderboard: (gameId: LeaderboardScope) =>
    http
      .get<LeaderboardEntry[]>('/leaderboard', { params: { gameId } })
      .then((res) => res.data),
};
