/**
 * Why this exists: one shared Socket.IO connection, typed with the event names
 * from docs/api-contract.md. It connects only once a user is signed in.
 * Drafted with an LLM (Claude Code).
 */
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { Run } from '../api/games.api';
import type { GameTick, LeaderboardUpdate, ScoreUpdate } from '../store/gameStore';

export interface ServerToClientEvents {
  'run:saved': (run: Run) => void;
  'score:updated': (update: ScoreUpdate) => void;
  'leaderboard:changed': (update: LeaderboardUpdate) => void;
  'game:tick': (tick: GameTick) => void;
}

export interface ClientToServerEvents {
  'game:submit': (
    run: Omit<Run, 'id' | 'userId' | 'finishedAt'>,
    ack: (saved: Run) => void,
  ) => void;
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.VITE_SOCKET_URL,
  {
    withCredentials: true, // the handshake is authenticated by the access cookie
    autoConnect: false,
  },
);
