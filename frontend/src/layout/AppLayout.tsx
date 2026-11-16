/**
 * Why this exists: the frame around every page: the solid blue arcade floor,
 * the nav bar and the centred content. While a game is playing the nav bar is
 * hidden so the cabinet gets the whole window. It also keeps the live socket
 * connected while signed in, and listens for a gamepad.
 * Drafted with an LLM (Claude Code).
 */
import { Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useGameEvents } from '../events/useGameEvents';
import { useGamepad } from '../input/useGamepad';
import { NavBar } from './NavBar';

export function AppLayout() {
  const signedIn = useAuthStore((state) => state.status === 'authenticated');
  const playing = useLocation().pathname.startsWith('/play/');
  const gamepad = useGamepad();
  useGameEvents(signedIn);

  return (
    <div className="min-h-screen flex flex-col">
      {!playing && <NavBar gamepad={gamepad} />}
      <main
        className={`relative flex-1 w-full mx-auto flex flex-col ${
          playing ? 'max-w-7xl px-2 py-2 sm:px-6 sm:py-3' : 'max-w-6xl p-3 sm:p-6'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}
