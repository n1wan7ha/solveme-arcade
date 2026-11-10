/**
 * Why this exists: the /dashboard page. It loads the player's runs once and
 * hands them to the presentational panels below.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { DotText } from '../ui/DotText';
import { Achievements } from './Achievements';
import { GameLibrary } from './GameLibrary';
import { GamePicker } from './GamePicker';
import { Leaderboard } from './Leaderboard';
import { RunHistory } from './RunHistory';
import { StatsGrid } from './StatsGrid';
import { summarise } from './stats';
import { useMyRuns } from './useMyRuns';
import { WelcomeCard } from './WelcomeCard';

export function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const runs = useMyRuns();
  const navigate = useNavigate();
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!user || !runs) {
    return <DotText className="text-2xl text-white animate-pulse m-auto">LOADING…</DotText>;
  }

  const summary = summarise(runs);
  const play = (slug: string) => navigate(`/play/${slug}`);

  return (
    <section className="fade-in space-y-4 sm:space-y-6">
      <WelcomeCard
        username={user.username}
        summary={summary}
        lastRun={runs[0]}
        onStart={() => setPickerOpen(true)}
        onPlay={play}
      />
      <StatsGrid summary={summary} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <GameLibrary runs={runs} onPlay={play} className="lg:col-span-7" />
        <RunHistory runs={runs} className="lg:col-span-5" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <Achievements runs={runs} className="lg:col-span-5" />
        <Leaderboard username={user.username} className="lg:col-span-7" />
      </div>
      <GamePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPlay={play} />
    </section>
  );
}
