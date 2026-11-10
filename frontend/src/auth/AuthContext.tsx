/**
 * Why this exists: the app's auth entry point. On start-up it asks the backend
 * who is signed in, and it tells the HTTP layer how to sign the user out if the
 * session cannot be renewed. The state itself lives in store/authStore.ts, so
 * components read it with useAuthStore() and need no React context.
 * Drafted with an LLM (Claude Code).
 */
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { setSessionExpiredHandler } from '../api/http';
import { useAuthStore } from '../store/authStore';

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const { clear, loadSession } = useAuthStore.getState();
    setSessionExpiredHandler(clear);
    void loadSession();
  }, []);

  return <>{children}</>;
}
