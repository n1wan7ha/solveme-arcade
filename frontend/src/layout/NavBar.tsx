/**
 * Why this exists: the sticky top bar, styled as the arcade's lit sign, with
 * the player's name ("1UP") and a logout link when signed in.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function NavBar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <nav className="sticky top-0 z-40 border-b-2 border-[var(--line)] bg-[#07051acc] backdrop-blur-md shadow-[0_2px_0_var(--ink),0_10px_30px_#ff2e8814]">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 h-14 flex items-center justify-between gap-2">
        <Link to={user ? '/dashboard' : '/'} className="pixel text-sm sm:text-lg select-none flex items-center gap-2">
          <span className="neon-cyan">SOLVE</span>
          <span className="neon-pink text-xs sm:text-sm">●</span>
          <span className="neon-pink">ME</span>
          <span className="hidden sm:inline neon-yellow text-[0.55rem] ml-1 self-end mb-1">ARCADE</span>
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-2 text-[0.6rem] pixel muted">
              <span className="neon-yellow blink">1UP</span>
            </span>
            <span className="bd rounded-md px-3 py-1 text-sm font-bold flex items-center gap-2 bg-[#05030f]">
              <i className="w-2 h-2 rounded-full bg-[var(--green)] shadow-[0_0_8px_var(--green)] inline-block" />
              {user.username}
            </span>
            <button
              type="button"
              className="pixel text-[0.6rem] muted hover:text-[var(--pink)] cursor-pointer transition-colors"
              onClick={handleLogout}
            >
              LOGOUT
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
