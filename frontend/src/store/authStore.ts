/**
 * Why this exists: the single source of truth for "who is signed in". Any
 * component can read it, and only these actions change it.
 * Drafted with an LLM (Claude Code).
 */
import { create } from 'zustand';
import { authApi } from '../api/auth.api';
import type { Credentials, User } from '../api/auth.api';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  loadSession: () => Promise<void>;
  login: (credentials: Credentials) => Promise<void>;
  register: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: 'loading',

  // The cookie is HttpOnly, so the only way to know if we are signed in is to ask.
  loadSession: async () => {
    try {
      set({ user: await authApi.me(), status: 'authenticated' });
    } catch {
      set({ user: null, status: 'anonymous' });
    }
  },

  login: async (credentials) => {
    set({ user: await authApi.login(credentials), status: 'authenticated' });
  },

  register: async (credentials) => {
    set({ user: await authApi.register(credentials), status: 'authenticated' });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      set({ user: null, status: 'anonymous' });
    }
  },

  clear: () => set({ user: null, status: 'anonymous' }),
}));
