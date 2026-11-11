/**
 * Why this exists: the frame around every page: the arcade hall background
 * (stars, neon floor, drifting emojis, CRT film), the marquee nav bar and the
 * centred content. It also keeps the live socket connected while a user is
 * signed in. Play pages get a wider, tighter stage so the cabinet can grow.
 * Drafted with an LLM (Claude Code).
 */
import { Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGameEvents } from '../events/useGameEvents';
import { FloatingEmojis } from './FloatingEmojis';
import { NavBar } from './NavBar';

export function AppLayout() {
  const signedIn = useAuthStore((state) => state.status === 'authenticated');
  const playing = useLocation().pathname.startsWith('/play/');
  useGameEvents(signedIn);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="hall-stars" aria-hidden />
      <div className="hall-floor" aria-hidden />
      {!playing && <FloatingEmojis />}
      <NavBar />
      <main
        className={`relative z-[1] flex-1 w-full mx-auto flex flex-col ${
          playing ? 'max-w-7xl px-2 py-2 sm:px-4 sm:py-3' : 'max-w-6xl p-3 sm:p-6'
        }`}
      >
        <Outlet />
      </main>
      <div className="hall-film" aria-hidden />
    </div>
  );
}
