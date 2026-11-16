/**
 * Why this exists: the arcade cabinet every game is played in. A marquee with
 * chasing bulbs (exit, title, switches), an ink bezel holding the screen, HUD
 * side panels (score, hi-score, lives, combo, how to play) and an optional
 * control deck. Moving the HUD to the sides leaves the screen most of the
 * window's height. It also powers the screen on with a jingle and a READY
 * banner, and runs the background beat at the tempo the game asks for.
 * Drafted with an LLM (Claude Code).
 */
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useSettings } from '../../settings/settingsStore';
import { setMusicTempo, startJingle, startMusic, stopMusic } from './audio';
import type { GameMeta } from './types';
import { PixelIcon } from '../../ui/PixelIcon';

interface ArcadeCabinetProps {
  meta: GameMeta;
  score: number;
  hiScore: number;
  status: { label: string; value: ReactNode };
  combo: string;
  onExit: () => void;
  onPause?: () => void;
  onFullscreen?: () => void;
  /** The screen contents. The caller sizes it and should add the "screen" class. */
  screen: ReactNode;
  /** Controls shown in the right panel on wide screens and under the screen on phones. */
  pad?: ReactNode;
  /** A full-width deck under the screen, e.g. the puzzle answer form. */
  deck?: ReactNode;
  controls: string;
  /** Background beat speed; the game raises it as play gets harder. */
  tempo: number;
  /** False while paused or after game over, which stops the beat. */
  running: boolean;
  /** Portrait games ask phones held sideways to turn upright. */
  portrait?: boolean;
}

const READY_MS = 1600;

function HudBox({ label, ghost, children }: { label: string; ghost?: string; children: ReactNode }) {
  return (
    <div className="hud">
      <div className="hud-label truncate">{label}</div>
      <div className="hud-value whitespace-nowrap mt-1">
        {ghost ? (
          <span className="lcd" data-ghost={ghost}>{children}</span>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function Switch({ label, on, onClick, children }: { label: string; on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      title={label}
      onClick={onClick}
      className={`h-9 min-w-9 px-1.5 grid place-items-center border-[3px] border-[var(--ink)] text-sm cursor-pointer ${
        on ? 'bg-[var(--white)] c-ink' : 'bg-[var(--ink)] c-white line-through'
      }`}
    >
      {children}
    </button>
  );
}

const pad5 = (n: number) => String(Math.max(0, n)).padStart(5, '0');

export function ArcadeCabinet({
  meta, score, hiScore, status, combo, onExit, onPause, onFullscreen, screen, pad, deck, controls,
  tempo, running, portrait = false,
}: ArcadeCabinetProps) {
  const settings = useSettings();
  const [ready, setReady] = useState(true);
  const best = Math.max(hiScore, score);
  const beatingBest = score > hiScore && hiScore > 0;

  // Power on: jingle + READY banner, once per cabinet.
  useEffect(() => {
    startJingle();
    const timer = setTimeout(() => setReady(false), READY_MS);
    return () => clearTimeout(timer);
  }, []);

  // The beat starts after the jingle and follows the game's tempo.
  useEffect(() => {
    if (!running || ready) return stopMusic();
    startMusic();
    return stopMusic;
  }, [running, ready]);
  useEffect(() => setMusicTempo(tempo), [tempo]);

  return (
    <section className="fade-in flex-1 flex justify-center items-start pt-2">
      <div className={`cabinet ${meta.color} w-full lg:w-auto max-w-full`}>
        {/* Marquee */}
        <header className="marquee">
          <div className="bulbs mb-2" aria-hidden />
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={onExit}
              className="pixel text-[0.6rem] whitespace-nowrap shrink-0 px-2.5 py-2 bg-[var(--white)] c-ink border-[3px] border-[var(--ink)] cursor-pointer hover:bg-[var(--ghost)]"
            >
              <PixelIcon name="left" className="mr-1.5" />EXIT
            </button>
            <h1 className="pixel text-sm sm:text-lg lg:text-2xl text-center truncate order-first w-full sm:order-none sm:w-auto">
              <span className="mr-3 hidden sm:inline-grid align-middle bg-[var(--white)] border-[3px] border-[var(--ink)] p-0.5"><PixelIcon name={meta.icon} size={28} /></span>
              {meta.name.toUpperCase()}
            </h1>
            <div className="flex gap-1 shrink-0">
              <Switch label="Sound effects" on={settings.sound} onClick={() => settings.toggle('sound')}><PixelIcon name="sound" size={18} /></Switch>
              <Switch label="Music" on={settings.music} onClick={() => settings.toggle('music')}><PixelIcon name="music" size={18} /></Switch>
              <Switch label="Screen effects (scanlines)" on={settings.screenFx} onClick={() => settings.toggle('screenFx')}>
                <span className="pixel text-[0.5rem]">FX</span>
              </Switch>
              {onPause && <Switch label="Pause (P)" on onClick={onPause}><PixelIcon name="pause" size={18} /></Switch>}
              {onFullscreen && <Switch label="Fullscreen" on onClick={onFullscreen}><PixelIcon name="fullscreen" size={18} /></Switch>}
            </div>
          </div>
        </header>

        {/* Body: HUD | screen | HUD */}
        <div className="grid grid-cols-2 lg:grid-cols-[minmax(160px,200px)_auto_minmax(160px,200px)] gap-2 lg:gap-3 pt-3">
          <aside className="order-1 grid grid-cols-2 lg:flex lg:flex-col gap-2">
            <HudBox label="SCORE" ghost="88888">
              <span className="c-blue">{pad5(score)}</span>
            </HudBox>
            <HudBox label={beatingBest ? 'NEW HI!' : 'HI-SCORE'} ghost="88888">
              <span className={beatingBest ? 'c-red blink' : 'c-ink'}>{pad5(best)}</span>
            </HudBox>
            <div className="hud hidden lg:block text-xs leading-relaxed">
              <div className="hud-label mb-2">HOW TO PLAY</div>
              {meta.how}
              <div className="hud-label mt-4 mb-2">CONTROLS</div>
              {controls}
            </div>
          </aside>

          <div className="order-3 lg:order-2 col-span-2 lg:col-span-1 bezel w-full lg:w-auto justify-self-center">
            <div className="relative">
              {screen}
              {ready && (
                <div className="absolute inset-x-0 top-1/3 z-[5] flex justify-center pointer-events-none">
                  <div className="pixel bg-[var(--red)] c-white border-4 border-[var(--ink)] px-4 py-3 text-xs sm:text-base blink">
                    PLAYER 1 · READY!
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="order-2 lg:order-3 grid grid-cols-2 lg:flex lg:flex-col gap-2">
            <HudBox label={status.label}>
              <span className="pixel c-red text-sm sm:text-xl">{status.value || '-'}</span>
            </HudBox>
            <HudBox label="COMBO">
              <span className="pixel c-blue text-sm sm:text-xl">{combo}</span>
            </HudBox>
            {pad && <div className="hidden lg:flex hud justify-center">{pad}</div>}
          </aside>
        </div>

        {pad && <div className="lg:hidden control-deck mt-3 p-3 flex justify-center">{pad}</div>}
        {deck && <div className="control-deck mt-3 p-3 sm:p-4">{deck}</div>}

        <p className="lg:hidden mt-3 text-center text-[0.7rem] px-2">
          <span className="pixel text-[0.5rem] c-red mr-2">CONTROLS</span>
          {controls}
        </p>
      </div>

      {portrait && (
        <div className="rotate-hint">
          <PixelIcon name="phone" size={64} />
          <p className="pixel text-sm">TURN YOUR PHONE UPRIGHT</p>
          <p className="text-sm">{meta.name} plays on a tall screen.</p>
        </div>
      )}
    </section>
  );
}
