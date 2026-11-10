/**
 * Why this exists: the RANKINGS panel. It loads a leaderboard over HTTP, then
 * swaps in live versions pushed by the server (leaderboard:changed), and shows
 * who is online and the latest scores.
 * Ported from the student's prototype; live updates drafted with an LLM (Claude Code).
 */
import { useEffect, useState } from 'react';
import { gamesApi } from '../api/games.api';
import type { LeaderboardEntry } from '../api/games.api';
import { findGame, GAMES } from '../games/registry';
import { useGameStore } from '../store/gameStore';
import { Card } from '../ui/Card';
import { DotText } from '../ui/DotText';

const ROWS_SHOWN = 8;
const MEDALS = ['🥇', '🥈', '🥉'];
const TABS = [
  { id: 'all', label: 'OVERALL', title: 'All games' },
  ...GAMES.map((game) => ({ id: game.slug, label: game.emoji, title: game.name })),
];

interface LeaderboardProps {
  username: string;
  className?: string;
}

export function Leaderboard({ username, className = '' }: LeaderboardProps) {
  const [gameId, setGameId] = useState('all');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [flash, setFlash] = useState(0);
  const connected = useGameStore((state) => state.connected);
  const playersOnline = useGameStore((state) => state.tick?.playersOnline);
  const feed = useGameStore((state) => state.feed);

  // Initial load whenever the tab changes.
  useEffect(() => {
    let active = true;
    gamesApi.leaderboard(gameId).then((rows) => active && setEntries(rows)).catch(() => {});
    return () => {
      active = false;
    };
  }, [gameId]);

  // Live updates: replace the table when the server pushes this tab's board.
  useEffect(
    () =>
      useGameStore.subscribe((state, previous) => {
        const live = state.leaderboards[gameId];
        if (live && live !== previous.leaderboards[gameId]) {
          setEntries(live);
          setFlash((n) => n + 1); // re-triggers the pop animation
        }
      }),
    [gameId],
  );

  const myIndex = entries.findIndex((entry) => entry.username === username);

  return (
    <Card className={`p-4 sm:p-5 ${className}`}>
      <div className="flex items-center justify-between mb-2 gap-2">
        <DotText as="h3" className="text-xl">RANKINGS</DotText>
        <span className="text-xs font-bold flex items-center gap-1.5" title="Socket.IO connection">
          <i className={`w-2 h-2 rounded-full inline-block ${connected ? 'bg-r animate-pulse' : 'bg-gray-400'}`} />
          {connected ? `LIVE · ${playersOnline ?? '…'} online` : 'OFFLINE'}
        </span>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            title={tab.title}
            className={`lbt ${tab.id === gameId ? 'on' : ''}`}
            onClick={() => setGameId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <p className="text-sm tx-r font-bold my-2">
        {myIndex >= 0 && entries[myIndex].score > 0
          ? `You are #${myIndex + 1} of ${entries.length} pilots`
          : 'Play a run to enter the rankings!'}
      </p>

      <table key={flash} className={`w-full text-left text-sm ${flash ? 'pop' : ''}`}>
        <thead>
          <tr className="text-[0.7rem] font-bold uppercase tracking-widest">
            <th className="py-2 w-14 text-center">Rank</th>
            <th>Pilot</th>
            <th className="text-right">Score</th>
          </tr>
        </thead>
        <tbody>
          {entries.slice(0, ROWS_SHOWN).map((entry, i) => {
            const isMe = entry.username === username;
            return (
              <tr
                key={entry.username}
                className={`border-b-2 border-dashed border-[#0a0f2c]/25 ${isMe ? 'bg-[#dbe5ff]' : ''}`}
                style={{ animation: `fi .4s both ${i * 50}ms` }}
              >
                <td className="py-2 text-center">{MEDALS[i] ?? entry.rank}</td>
                <td className="font-bold">{entry.username}{isMe ? ' (you)' : ''}</td>
                <td className="text-right dot text-xl tx-b">{entry.score}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {feed.length > 0 && (
        <div className="mt-3 space-y-1 text-xs">
          {feed.map((item, i) => {
            const game = findGame(item.gameId);
            return (
              <p key={`${item.username}-${item.score}-${i}`} className="fade-in opacity-80">
                🔔 <b>{item.username}</b> scored <b>{item.score}</b> in {game?.emoji} {game?.name ?? item.gameId}
              </p>
            );
          })}
        </div>
      )}
    </Card>
  );
}
