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

const ROWS_SHOWN = 8;
const ORDINALS = ['1ST', '2ND', '3RD'];
/** Classic arcade high-score tables colour each row differently. */
const ROW_COLOURS = ['neon-yellow', 'neon-cyan', 'neon-pink', 'neon-green'];
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
        <h3 className="panel-title neon-pink">HIGH SCORES</h3>
        <span className="text-xs font-bold flex items-center gap-1.5 muted" title="Socket.IO connection">
          <i className={`w-2 h-2 rounded-full inline-block ${connected ? 'bg-[var(--green)] shadow-[0_0_8px_var(--green)] animate-pulse' : 'bg-gray-500'}`} />
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

      <p className="pixel text-[0.55rem] neon-yellow my-3">
        {myIndex >= 0 && entries[myIndex].score > 0
          ? `YOU ARE #${myIndex + 1} OF ${entries.length} PLAYERS`
          : 'PLAY A RUN TO ENTER THE TABLE!'}
      </p>

      <div className="hud p-2 sm:p-3">
      <table key={flash} className={`w-full text-left text-sm ${flash ? 'pop' : ''}`}>
        <thead>
          <tr className="pixel text-[0.5rem] muted">
            <th className="py-2 w-14 text-center">RANK</th>
            <th>NAME</th>
            <th className="text-right pr-1">SCORE</th>
          </tr>
        </thead>
        <tbody>
          {entries.slice(0, ROWS_SHOWN).map((entry, i) => {
            const isMe = entry.username === username;
            return (
              <tr
                key={entry.username}
                className={`pixel text-[0.6rem] sm:text-[0.7rem] ${ROW_COLOURS[i % ROW_COLOURS.length]} ${isMe ? 'bg-[#ffffff12] outline outline-1 outline-[var(--cyan)]' : ''}`}
                style={{ animation: `fi .4s both ${i * 50}ms` }}
              >
                <td className="py-2.5 text-center">{ORDINALS[i] ?? `${entry.rank}TH`}</td>
                <td className="truncate max-w-[10rem]">{entry.username.toUpperCase()}{isMe ? ' ◀' : ''}</td>
                <td className="text-right pr-1 tabular-nums">{String(entry.score).padStart(6, '0')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {entries.length === 0 && <p className="pixel text-[0.55rem] muted text-center py-6 blink">NO SCORES YET</p>}
      </div>

      {feed.length > 0 && (
        <div className="mt-3 space-y-1 text-xs">
          {feed.map((item, i) => {
            const game = findGame(item.gameId);
            return (
              <p key={`${item.username}-${item.score}-${i}`} className="fade-in muted">
                🔔 <b className="text-[var(--text)]">{item.username}</b> scored <b className="neon-green">{item.score}</b> in {game?.emoji} {game?.name ?? item.gameId}
              </p>
            );
          })}
        </div>
      )}
    </Card>
  );
}
