/**
 * Why this exists: route guards. ProtectedRoute keeps signed-out visitors away
 * from the arcade, and GuestRoute keeps signed-in players off the login page.
 * Drafted with an LLM (Claude Code).
 */
import { Navigate, Outlet } from 'react-router-dom';
import { DotText } from '../ui/DotText';
import { useAuthStore } from '../store/authStore';

function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <DotText className="pixel text-sm neon-cyan blink">LOADING…</DotText>
    </div>
  );
}

export function ProtectedRoute() {
  const status = useAuthStore((state) => state.status);
  if (status === 'loading') return <Loading />;
  if (status === 'anonymous') return <Navigate to="/" replace />;
  return <Outlet />;
}

export function GuestRoute() {
  const status = useAuthStore((state) => state.status);
  if (status === 'loading') return <Loading />;
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
