/**
 * Why this exists: the prototype's single log-in / register card, shared by
 * LoginPage and RegisterPage so the markup lives in one place.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../api/http';
import { Button } from '../ui/Button';
import { useAuthStore } from '../store/authStore';

type Mode = 'login' | 'register';

const LOADER_SQUARES = [0, 0.1, 0.2, 0.3, 0.4, 0.5];

export function AuthForm({ mode }: { mode: Mode }) {
  const action = useAuthStore((state) => (mode === 'login' ? state.login : state.register));
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await action({ username: username.trim(), password });
      navigate('/dashboard');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex-1 flex flex-col items-center justify-center gap-6 fade-in py-6">
      <div className="text-center select-none">
        <div className="flex gap-1.5 justify-center mb-5" aria-hidden>
          {LOADER_SQUARES.map((delay, i) => (
            <i
              key={delay}
              className="sq"
              style={{
                animationDelay: `${delay}s`,
                background: i === LOADER_SQUARES.length - 1 ? 'var(--pink)' : undefined,
                boxShadow: i === LOADER_SQUARES.length - 1 ? '0 0 10px var(--pink)' : undefined,
              }}
            />
          ))}
        </div>
        <h1 className="pixel text-3xl sm:text-5xl leading-tight">
          <span className="neon-cyan">SOLVE</span>
          <span className="neon-pink">ME</span>
        </h1>
        <p className="pixel text-xs sm:text-sm neon-yellow mt-3 tracking-[0.4em]">ARCADE</p>
        <p className="pixel text-[0.6rem] sm:text-xs neon-pink mt-6 blink">INSERT COIN</p>
      </div>

      <div className="cabinet t-r w-full max-w-sm">
        <div className="marquee text-center">
          <h2 className="pixel text-xs sm:text-sm neon-yellow">
            {mode === 'login' ? 'PLAYER LOGIN' : 'NEW PLAYER'}
          </h2>
        </div>

        <div className="pt-4 px-2 pb-2">
          <div className="flex gap-2 mb-4">
            <Link to="/" className={`lbt flex-1 pixel text-[0.6rem] ${mode === 'login' ? 'on' : ''}`}>
              LOG IN
            </Link>
            <Link to="/register" className={`lbt flex-1 pixel text-[0.6rem] ${mode === 'register' ? 'on' : ''}`}>
              REGISTER
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="lab" htmlFor="username">Player name</label>
            <input
              id="username"
              className="inp mb-3 font-bold"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label className="lab" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="inp"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {mode === 'register' && (
              <p className="text-xs muted mt-1.5">
                3–20 letters, numbers or _ · password 8+ characters
              </p>
            )}
            <div className="neon-pink text-sm font-bold text-center min-h-6 mt-2" role="alert">
              {error}
            </div>
            <Button type="submit" className="w-full mt-1 glow" disabled={busy}>
              {busy ? 'PLEASE WAIT…' : mode === 'login' ? '▶ PRESS START' : '▶ CREATE PLAYER'}
            </Button>
          </form>

          <p className="text-center text-xs muted mt-4">
            Demo accounts: <b className="text-[var(--text)]">niwantha</b>, <b className="text-[var(--text)]">user</b>,{' '}
            <b className="text-[var(--text)]">player</b> · Password: <b className="text-[var(--text)]">1234</b>
          </p>
        </div>
      </div>

      <p className="pixel text-[0.5rem] muted">© SOLVEME ARCADE · 1 CREDIT = 1 PLAY</p>
    </section>
  );
}
