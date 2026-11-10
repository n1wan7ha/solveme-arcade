/**
 * Why this exists: puzzles come from OUR backend (/fish/puzzle), which talks to
 * the third-party Fish API. The browser never contacts marcconrad.com directly.
 * Drafted with an LLM (Claude Code).
 */
import { http } from './http';

export type PuzzleCategory = 'fish' | 'banana' | 'tomato' | 'smile';

export interface Puzzle {
  sol: number;
  /** Ready to use as an <img src>. */
  imageSrc: string;
}

export const fishApi = {
  getPuzzle: (category: PuzzleCategory): Promise<Puzzle> =>
    http
      .get<{ sol: number; image: string }>('/fish/puzzle', { params: { category } })
      .then(({ data }) => ({
        sol: data.sol,
        imageSrc: `data:image/png;base64,${data.image}`,
      })),
};
