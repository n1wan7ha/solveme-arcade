/**
 * Why this exists: gives an action game its AnswerQueue, filled from our own
 * backend's /fish/puzzle, and stops it when the game unmounts.
 * Drafted with an LLM (Claude Code).
 */
import { useEffect, useState } from 'react';
import { fishApi } from '../../api/fish.api';
import type { PuzzleCategory } from '../../api/fish.api';
import { AnswerQueue } from './answers';

export function useAnswerQueue(category: PuzzleCategory): AnswerQueue {
  const [queue] = useState(
    () => new AnswerQueue(() => fishApi.getPuzzle(category).then((puzzle) => puzzle.sol)),
  );

  useEffect(() => {
    queue.start();
    return () => queue.stop();
  }, [queue]);

  return queue;
}
