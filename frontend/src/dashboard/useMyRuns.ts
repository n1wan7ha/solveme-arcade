/**
 * Why this exists: loads the signed-in player's runs, and reloads them the
 * moment the server says a new run was saved (the run:saved socket event).
 * Drafted with an LLM (Claude Code).
 */
import { useEffect, useState } from 'react';
import { gamesApi } from '../api/games.api';
import type { Run } from '../api/games.api';
import { findGame } from '../games/registry';
import { useGameStore } from '../store/gameStore';

/** Newest first. null while loading. */
export function useMyRuns(): Run[] | null {
  const [runs, setRuns] = useState<Run[] | null>(null);
  const lastSavedRun = useGameStore((state) => state.lastSavedRun);

  useEffect(() => {
    let active = true; // ignore a response that arrives after unmount
    gamesApi
      .myRuns()
      .then((all) => active && setRuns(all.filter((run) => findGame(run.gameId))))
      .catch(() => active && setRuns([]));
    return () => {
      active = false;
    };
  }, [lastSavedRun]);

  return runs;
}
