/**
 * Why this exists: the /play/:gameId route. It looks the game up in the
 * registry and renders its component. "Play again" bumps a counter used as
 * the React key, which mounts a completely fresh game.
 * Drafted with an LLM (Claude Code).
 */
import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { findGame } from './registry';

export function PlayPage() {
  const { gameId } = useParams();
  const [round, setRound] = useState(0);
  const game = findGame(gameId);

  if (!game) return <Navigate to="/dashboard" replace />;

  const { Component } = game;
  return <Component key={`${game.slug}-${round}`} meta={game} onPlayAgain={() => setRound((n) => n + 1)} />;
}
