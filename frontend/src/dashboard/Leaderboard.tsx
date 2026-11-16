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
import { PixelIcon } from '../ui/PixelIcon';

const ROWS_SHOWN = 8;
const ORDINALS = ['1ST', '2ND', '3RD'];
const TABS = [
  { id: 'all', label: 'OVERALL', title: 'All games' },
  ...GAMES.map((game) => ({ id: game.slug, label: <PixelIcon name={game.icon} size={18} label={game.name} />, title: game.name })),
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
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="panel-title">HIGH SCORES</h3>
        <span className="pixel text-[0.5rem] flex items-center gap-2" title="Socket.IO connection">
          <i className={`w-2.5 h-2.5 inline-block border-2 border-[var(--ink)] ${connected ? 'bg-[var(--red)] blink' : 'bg-[var(--white)]'}`} />
          {connected ? `LIVE · ${playersOnline ?? '…'} ONLINE` : 'OFFLINE'}
        </span>
      </div>

      <div className="flex overflow-x-auto pb-1">
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            type="button"
            title={tab.title}
            className={`lbt ${i ? '-ml-[3px]' : ''} ${tab.id === gameId ? 'on' : ''}`}
            onClick={() => setGameId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* The board itself: a blue screen with white type, like the attract-mode table */}
      <div className="mt-3 bg-[var(--blue)] border-4 border-[var(--ink)] c-white p-3 sm:p-4">
        <p className="pixel text-[0.55rem] text-center mb-3">
          {myIndex >= 0 && entries[myIndex].score > 0
            ? `YOU ARE #${myIndex + 1} OF ${entries.length}`
            : 'PLAY A RUN TO ENTER THE TABLE!'}
        </p>
        <table key={flash} className={`w-full text-left ${flash ? 'pop' : ''}`}>
          <thead>
            <tr className="pixel text-[0.45rem]">
              <th className="py-2 w-12">RANK</th>
              <th className="w-14">TAG</th>
              <th>NAME</th>
              <th className="text-right">SCORE</th>
            </tr>
          </thead>
          <tbody>
            {entries.slice(0, ROWS_SHOWN).map((entry, i) => {
              const isMe = entry.username === username;
              return (
                <tr
                  key={entry.username}
                  className={`pixel text-[0.6rem] sm:text-[0.7rem] ${isMe ? 'bg-[var(--red)]' : ''}`}
                  style={{ animation: `fi .4s both ${i * 50}ms` }}
                >
                  <td className="py-2.5 pl-1">{ORDINALS[i] ?? `${entry.rank}TH`}</td>
                  <td>{entry.initials ?? '---'}</td>
                  <td className="truncate max-w-[9rem] text-[0.5rem] sm:text-[0.55rem]">{entry.username.toUpperCase()}</td>
                  <td className="text-right pr-1 tabular-nums">{String(entry.score).padStart(6, '0')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {entries.length === 0 && <p className="pixel text-[0.55rem] text-center py-6 blink">NO SCORES YET</p>}
      </div>

      {feed.length > 0 && (
        <div className="mt-3 space-y-1 text-xs">
          {feed.map((item, i) => {
            const game = findGame(item.gameId);
            return (
              <p key={`${item.username}-${item.score}-${i}`} className="fade-in">
                <span className="pixel text-[0.45rem] bg-[var(--red)] c-white px-1 py-0.5 mr-1">NEW</span>
                <b>{item.username}</b> scored <b className="c-blue">{item.score}</b> in {game && <PixelIcon name={game.icon} />} {game?.name ?? item.gameId}
              </p>
            );
          })}
        </div>
      )}
    </Card>
  );
}
