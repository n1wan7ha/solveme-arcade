/**
 * Why this exists: holds what the server pushes in real time (live
 * leaderboards, other players' scores, the server tick) so any component can
 * show it. Only useGameEvents writes here.
 * Drafted with an LLM (Claude Code).
 */
import { create } from 'zustand';
import type { LeaderboardEntry, Run } from '../api/games.api';

export interface GameTick {
  serverTime: string;
  playersOnline: number;
}

export interface ScoreUpdate {
  username: string;
  gameId: string;
  score: number;
}

export interface LeaderboardUpdate {
  gameId: string;
  leaderboard: LeaderboardEntry[];
}

const FEED_LENGTH = 3;

interface GameState {
  connected: boolean;
  tick: GameTick | null;
  feed: ScoreUpdate[]; // newest first
  leaderboards: Record<string, LeaderboardEntry[]>;
  lastSavedRun: Run | null;

  setConnected: (connected: boolean) => void;
  setTick: (tick: GameTick) => void;
  addScore: (update: ScoreUpdate) => void;
  setLeaderboard: (update: LeaderboardUpdate) => void;
  runSaved: (run: Run) => void;
}

export const useGameStore = create<GameState>()((set) => ({
  connected: false,
  tick: null,
  feed: [],
  leaderboards: {},
  lastSavedRun: null,

  setConnected: (connected) => set({ connected }),
  setTick: (tick) => set({ tick }),
  addScore: (update) =>
    set((state) => ({ feed: [update, ...state.feed].slice(0, FEED_LENGTH) })),
  setLeaderboard: ({ gameId, leaderboard }) =>
    set((state) => ({ leaderboards: { ...state.leaderboards, [gameId]: leaderboard } })),
  runSaved: (run) => set({ lastSavedRun: run }),
}));
