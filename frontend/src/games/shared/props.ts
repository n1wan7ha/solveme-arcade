/**
 * Why this exists: the contract between the router and every game component,
 * so PlayPage can render any game the same way.
 * Drafted with an LLM (Claude Code).
 */
import type { ComponentType } from 'react';
import type { GameMeta } from './types';

export interface GameProps {
  meta: GameMeta;
  onPlayAgain: () => void;
}

/** A catalogue entry plus the component that plays it. */
export interface GameEntry extends GameMeta {
  Component: ComponentType<GameProps>;
}
