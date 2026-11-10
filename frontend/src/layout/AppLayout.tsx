/**
 * Why this exists: the frame around every page (nav bar, drifting emoji
 * background, centred content). It also keeps the live socket connected while
 * a user is signed in.
 * Drafted with an LLM (Claude Code).
 */
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGameEvents } from '../events/useGameEvents';
import { FloatingEmojis } from './FloatingEmojis';
import { NavBar } from './NavBar';

export function AppLayout() {
  const signedIn = useAuthStore((state) => state.status === 'authenticated');
  useGameEvents(signedIn);

  return (
    <div className="min-h-screen flex flex-col">
      <FloatingEmojis />
      <NavBar />
      <main className="relative z-[1] flex-1 w-full max-w-6xl mx-auto p-3 sm:p-6 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
