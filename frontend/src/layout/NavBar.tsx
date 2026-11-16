/**
 * Why this exists: the top bar, printed like an arcade sign: logo, a gamepad
 * badge when one is connected, the player's name and a logout link.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { PixelIcon } from '../ui/PixelIcon';

export function NavBar({ gamepad }: { gamepad: boolean }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <nav className="sticky top-0 z-40 bg-[var(--white)] border-b-4 border-[var(--ink)]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
        <Link to={user ? '/dashboard' : '/'} className="pixel text-sm sm:text-base select-none flex items-center gap-1">
          <span className="c-blue">SOLVE</span>
          <span className="inline-block w-3 h-3 bg-[var(--red)] border-2 border-[var(--ink)] mx-1" />
          <span className="c-red">ME</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {gamepad && (
            <span className="pixel text-[0.5rem] bg-[var(--blue)] c-white px-2 py-1.5 border-2 border-[var(--ink)]" title="Gamepad connected">
              <PixelIcon name="gamepad" size={14} className="mr-1" />PAD
            </span>
          )}
          {user && (
            <>
              <span className="pixel text-[0.55rem] bg-[var(--ink)] c-white px-2.5 py-2 flex items-center gap-2">
                <span className="c-red">1P</span>
                {user.username.toUpperCase()}
              </span>
              <button type="button" className="pixel text-[0.55rem] underline underline-offset-4 cursor-pointer hover:text-[var(--red)]" onClick={handleLogout}>
                LOGOUT
              </button>
            </>
          )}
        </div>
      </div>
      <div className="stripe" />
    </nav>
  );
}
