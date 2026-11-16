/**
 * Why this exists: the prototype's single log-in / register card, shared by
 * LoginPage and RegisterPage so the markup lives in one place.
 * Ported from the student's prototype; React version drafted with an LLM (Claude Code).
 */
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiErrorMessage } from '../api/http';
import { coin } from '../games/shared/audio';
import { SnakeDemo } from '../games/snake/SnakeDemo';
import { Button } from '../ui/Button';
import { useAuthStore } from '../store/authStore';
import { PixelIcon } from '../ui/PixelIcon';

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
      coin();
      navigate('/dashboard');
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex-1 grid lg:grid-cols-[auto_minmax(0,420px)] gap-8 lg:gap-14 items-center justify-center fade-in py-4 sm:py-8">
      {/* Attract mode: a demo cabinet playing by itself */}
      <div className="order-2 lg:order-1 justify-self-center w-full max-w-[300px] lg:max-w-[340px]">
        <div className="cabinet t-r">
          <div className="marquee text-center">
            <div className="bulbs mb-2" aria-hidden />
            <span className="pixel text-[0.6rem] inline-flex items-center gap-2"><PixelIcon name="snake" size={18} /> SNAKE</span>
          </div>
          <div className="bezel mt-3">
            <SnakeDemo />
          </div>
        </div>
      </div>

      <div className="order-1 lg:order-2 w-full max-w-[420px] justify-self-center">
        <div className="text-center select-none mb-8">
          <div className="flex gap-1.5 justify-center mb-6" aria-hidden>
            {LOADER_SQUARES.map((delay, i) => (
              <i
                key={delay}
                className="sq"
                style={{ animationDelay: `${delay}s`, background: i % 2 ? 'var(--red)' : undefined }}
              />
            ))}
          </div>
          <h1 className="print text-4xl sm:text-5xl leading-tight">SOLVE<br />ME</h1>
          <div className="stripe w-48 mx-auto mt-5" />
          <p className="pixel text-[0.6rem] c-white mt-3 tracking-[0.5em]">ARCADE</p>
        </div>

        <div className="card p-5 sm:p-6">
          <h2 className="panel-title">{mode === 'login' ? 'PLAYER LOGIN' : 'NEW PLAYER'}</h2>

          <div className="grid grid-cols-2 my-4">
            <Link to="/" className={`lbt pixel text-[0.55rem] ${mode === 'login' ? 'on' : ''}`}>
              LOG IN
            </Link>
            <Link to="/register" className={`lbt pixel text-[0.55rem] -ml-[3px] ${mode === 'register' ? 'on' : ''}`}>
              REGISTER
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="lab" htmlFor="username">PLAYER NAME</label>
            <input
              id="username"
              className="inp mb-4"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label className="lab" htmlFor="password">PASSWORD</label>
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
            <div className="c-red text-sm font-bold text-center min-h-6 mt-2" role="alert">
              {error}
            </div>
            <Button type="submit" className="w-full mt-1 glow" disabled={busy}>
              {busy ? 'PLEASE WAIT…' : (
                <>
                  <PixelIcon name="play" className="mr-2" />
                  {mode === 'login' ? 'PRESS START' : 'CREATE PLAYER'}
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs muted mt-4">
            Demo accounts: <b className="c-ink">niwantha</b>, <b className="c-ink">user</b>, <b className="c-ink">player</b> ·
            Password: <b className="c-ink">1234</b>
          </p>
        </div>
      </div>
    </section>
  );
}
