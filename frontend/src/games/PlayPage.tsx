/**
 * Why this exists: the /play/:gameId route. For now it confirms the game
 * exists; Module 6 renders the real game component here.
 * Drafted with an LLM (Claude Code).
 */
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { DotText } from '../ui/DotText';
import { findGame } from './registry';

export function PlayPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const game = findGame(gameId);

  if (!game) return <Navigate to="/dashboard" replace />;

  return (
    <section className="fade-in flex-1 flex items-center justify-center">
      <Card className="p-6 max-w-sm w-full text-center">
        <div className="text-5xl float">{game.emoji}</div>
        <DotText as="h2" className="text-2xl mt-2">{game.name.toUpperCase()}</DotText>
        <p className="my-4 text-sm opacity-80">{game.how}</p>
        <p className="mb-4 text-xs opacity-60">This game arrives in Module 6.</p>
        <Button variant="secondary" onClick={() => navigate('/dashboard')}>⟵ DASHBOARD</Button>
      </Card>
    </section>
  );
}
