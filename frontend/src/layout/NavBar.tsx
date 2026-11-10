/**
 * Why this exists: the sticky top bar with the logo and, when signed in, the
 * player's name and a logout link.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { DotText } from '../ui/DotText';

export function NavBar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <nav className="bg-white border-b-[3px] border-[#0a0f2c] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-5 h-14 flex items-center justify-between gap-2">
        <DotText className="text-2xl select-none">
          SOLVE<span className="tx-r">●</span>ME
        </DotText>
        {user && (
          <div className="flex items-center gap-2">
            <span className="bd rounded-full px-3 py-0.5 text-sm font-bold flex items-center gap-2">
              <i className="w-2 h-2 rounded-full bg-r inline-block" />
              {user.username}
            </span>
            <button type="button" className="text-sm font-bold underline cursor-pointer" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
