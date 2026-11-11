/**
 * Why this exists: the arcade cabinet every game is played in. A lit marquee
 * (exit, title, sound / pause / fullscreen), a bezel holding the CRT screen,
 * HUD side panels (score, hi-score, lives, combo, how to play) and an
 * optional control deck. Moving the HUD to the sides leaves the screen most
 * of the window's height. Replaces the old GameHeader bar.
 * Drafted with an LLM (Claude Code).
 */
import { useState } from 'react';
import type { ReactNode } from 'react';
import { isMuted, toggleMute } from './audio';
import type { GameMeta } from './types';

interface ArcadeCabinetProps {
  meta: GameMeta;
  score: number;
  hiScore: number;
  status: { label: string; value: string };
  combo: string;
  onExit: () => void;
  onPause?: () => void;
  onFullscreen?: () => void;
  /** The CRT screen contents. The caller sizes it. */
  screen: ReactNode;
  /** Controls shown in the right panel on wide screens and under the screen on phones. */
  pad?: ReactNode;
  /** A full-width deck under the screen, e.g. the puzzle answer form. */
  deck?: ReactNode;
  controls: string;
}

const pad5 = (n: number) => String(Math.max(0, n)).padStart(5, '0');

function HudBox({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`hud ${className}`}>
      <div className="hud-label truncate">{label}</div>
      <div className="hud-value whitespace-nowrap">{children}</div>
    </div>
  );
}

function MarqueeButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="w-9 h-9 grid place-items-center rounded-md bg-[#05030fcc] border-2 border-[var(--ink)] text-base cursor-pointer hover:bg-[#05030f] hover:shadow-[0_0_12px_var(--tone)] transition-shadow"
    >
      {children}
    </button>
  );
}

export function ArcadeCabinet({
  meta, score, hiScore, status, combo, onExit, onPause, onFullscreen, screen, pad, deck, controls,
}: ArcadeCabinetProps) {
  const [muted, setMuted] = useState(isMuted);
  const best = Math.max(hiScore, score);
  const beatingBest = score > hiScore && hiScore > 0;

  return (
    <section className="fade-in flex-1 flex justify-center items-start">
      <div className={`cabinet ${meta.color} w-full lg:w-auto max-w-full`}>
        {/* Marquee */}
        <header className="marquee flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onExit}
            className="pixel text-[0.6rem] whitespace-nowrap shrink-0 px-2.5 py-2 rounded-md bg-[#05030fcc] border-2 border-[var(--ink)] cursor-pointer hover:text-[var(--pink)]"
          >
            ◀ EXIT
          </button>
          <h1 className="pixel text-xs sm:text-base lg:text-xl text-center truncate">
            <span className="mr-2 hidden sm:inline">{meta.emoji}</span>
            <span className="neon-yellow">{meta.name.toUpperCase()}</span>
          </h1>
          <div className="flex gap-1.5 shrink-0">
            <MarqueeButton label={muted ? 'Unmute' : 'Mute'} onClick={() => setMuted(toggleMute())}>
              {muted ? '🔇' : '🔊'}
            </MarqueeButton>
            {onPause && <MarqueeButton label="Pause (P)" onClick={onPause}>⏸</MarqueeButton>}
            {onFullscreen && <MarqueeButton label="Fullscreen" onClick={onFullscreen}>⛶</MarqueeButton>}
          </div>
        </header>

        {/* Body: HUD | screen | HUD */}
        <div className="grid grid-cols-2 lg:grid-cols-[minmax(150px,190px)_auto_minmax(150px,190px)] gap-2 lg:gap-3 pt-3">
          <aside className="order-1 grid grid-cols-2 lg:flex lg:flex-col gap-2">
            <HudBox label="SCORE">
              <span className="neon-cyan">{pad5(score)}</span>
            </HudBox>
            <HudBox label={beatingBest ? 'NEW HI!' : 'HI-SCORE'}>
              <span className={beatingBest ? 'neon-pink blink' : 'neon-yellow'}>{pad5(best)}</span>
            </HudBox>
            <div className="hud hidden lg:block text-xs leading-relaxed muted">
              <div className="hud-label mb-2">HOW TO PLAY</div>
              {meta.how}
              <div className="hud-label mt-4 mb-2">CONTROLS</div>
              {controls}
            </div>
          </aside>

          <div className="order-3 lg:order-2 col-span-2 lg:col-span-1 bezel w-full lg:w-auto justify-self-center">
            {screen}
          </div>

          <aside className="order-2 lg:order-3 grid grid-cols-2 lg:flex lg:flex-col gap-2">
            <HudBox label={status.label}>
              <span className="neon-pink">{status.value || '—'}</span>
            </HudBox>
            <HudBox label="COMBO">
              <span className="neon-green">{combo}</span>
            </HudBox>
            {pad && <div className="hidden lg:flex hud justify-center">{pad}</div>}
          </aside>
        </div>

        {pad && <div className="lg:hidden control-deck mt-3 p-3 flex justify-center">{pad}</div>}
        {deck && <div className="control-deck mt-3 p-3 sm:p-4">{deck}</div>}

        <p className="lg:hidden mt-3 text-center text-[0.7rem] muted px-2">
          <span className="pixel text-[0.55rem] neon-yellow mr-2">CONTROLS</span>
          {controls}
        </p>
      </div>
    </section>
  );
}
