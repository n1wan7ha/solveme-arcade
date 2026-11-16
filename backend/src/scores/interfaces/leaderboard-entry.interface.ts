/**
 * Why this exists: the public shape of one leaderboard row.
 * Drafted with an LLM (Claude Code).
 */
export interface LeaderboardEntry {
  rank: number;
  username: string;
  initials: string | null; // three-letter arcade tag, if the player set one
  score: number;
}
