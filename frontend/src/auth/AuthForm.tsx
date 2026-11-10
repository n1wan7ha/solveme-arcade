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
import { Card } from '../ui/Card';
import { DotText } from '../ui/DotText';
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
    <section className="flex-1 flex items-center justify-center fade-in">
      <Card className="w-full max-w-sm p-6 sm:p-8">
        <div className="flex gap-1 justify-center mb-4" aria-hidden>
          {LOADER_SQUARES.map((delay, i) => (
            <i
              key={delay}
              className="sq"
              style={{
                animationDelay: `${delay}s`,
                background: i === LOADER_SQUARES.length - 1 ? 'var(--r)' : undefined,
              }}
            />
          ))}
        </div>
        <DotText as="h2" className="text-3xl text-center">
          {mode === 'login' ? 'WELCOME BACK' : 'NEW PILOT'}
        </DotText>
        <p className="text-sm text-center opacity-70 mb-5">
          Log in or create an account to play.
        </p>

        <div className="flex gap-2 mb-4">
          <Link to="/" className={`lbt flex-1 ${mode === 'login' ? 'on' : ''}`}>
            LOG IN
          </Link>
          <Link to="/register" className={`lbt flex-1 ${mode === 'register' ? 'on' : ''}`}>
            REGISTER
          </Link>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="lab" htmlFor="username">Pilot name</label>
          <input
            id="username"
            className="inp mb-3"
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
            <p className="text-xs opacity-70 mt-1">
              3–20 letters, numbers or _ · password 8+ characters
            </p>
          )}
          <div className="tx-r text-sm font-bold text-center min-h-6 mt-1" role="alert">
            {error}
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'PLEASE WAIT…' : mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
          </Button>
        </form>

        <p className="text-center text-xs opacity-70 mt-4">
          Demo accounts: <b>niwantha</b>, <b>user</b>, <b>player</b> · Password: <b>1234</b>
        </p>
      </Card>
    </section>
  );
}
