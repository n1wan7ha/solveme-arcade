/**
 * Why this exists: saves a finished game as a Run in PostgreSQL through
 * POST /games/:slug/runs (no localStorage). It saves at most once, skips runs
 * with no attempts, and loads past runs so the result screen can spot a new
 * personal best.
 * Drafted with an LLM (Claude Code).
 */
import { useEffect, useRef, useState } from 'react';
import { gamesApi } from '../../api/games.api';
import type { Run } from '../../api/games.api';
import type { GameMeta, RunStats } from './types';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface RunRecorder {
  history: Run[]; // runs from before this game
  status: SaveStatus;
  save: (stats: RunStats) => Promise<void>;
}

export function useRunRecorder(meta: GameMeta): RunRecorder {
  const [startedAt] = useState(() => new Date().toISOString());
  const [history, setHistory] = useState<Run[]>([]);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const saved = useRef(false);

  useEffect(() => {
    gamesApi.myRuns().then(setHistory).catch(() => setHistory([]));
  }, []);

  async function save(stats: RunStats): Promise<void> {
    if (saved.current || stats.attempts === 0) return; // like the prototype
    saved.current = true;
    setStatus('saving');
    try {
      await gamesApi.createRun(meta.slug, { ...stats, startedAt });
      setStatus('saved');
    } catch {
      saved.current = false; // allow a retry
      setStatus('error');
    }
  }

  return { history, status, save };
}
