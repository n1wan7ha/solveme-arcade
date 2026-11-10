/**
 * Why this exists: everything the three canvas games share on screen: header,
 * stage, pause overlay, fullscreen, sound, the game loop, and saving the run
 * when the engine reports game over. Each game passes in its engine, renderer
 * and input handlers.
 * Drafted with an LLM (Claude Code), from the prototype's v-play section.
 */
import { useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode, RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { DotText } from '../../ui/DotText';
import { play } from './audio';
import type { BaseEngine, BaseState } from './engine';
import { GameHeader } from './GameHeader';
import { H, SCALE, W } from './math';
import { ResultModal } from './ResultModal';
import type { Hud, RunStats } from './types';
import { useGameLoop } from './useGameLoop';
import { useRunRecorder } from './useRunRecorder';
import type { GameProps } from './props';

interface ActionGameShellProps<S extends BaseState> extends GameProps {
  engine: BaseEngine<S>;
  draw: (ctx: CanvasRenderingContext2D, state: S) => void;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasProps?: HTMLAttributes<HTMLCanvasElement>;
  controls: string;
  children?: ReactNode; // extra controls under the stage, e.g. Snake's D-pad
}

const sameHud = (a: Hud, b: Hud) => a.score === b.score && a.combo === b.combo && a.lives === b.lives;

export function ActionGameShell<S extends BaseState>({
  meta, onPlayAgain, engine, draw, canvasRef, canvasProps, controls, children,
}: ActionGameShellProps<S>) {
  const navigate = useNavigate();
  const recorder = useRunRecorder(meta);
  const stageRef = useRef<HTMLDivElement>(null);
  const [hud, setHud] = useState(() => engine.hud());
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<RunStats | null>(null);
  const ended = useRef(false);

  useGameLoop(canvasRef, engine, draw, () => {
    engine.drainSounds().forEach(play);
    const next = engine.hud();
    setHud((previous) => (sameHud(previous, next) ? previous : next));

    if (engine.state.over && !ended.current) {
      ended.current = true;
      const stats = engine.stats();
      setResult(stats);
      void recorder.save(stats);
    }
  });

  const togglePause = () => {
    engine.togglePause();
    setPaused(engine.state.paused);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'p' || event.key === 'P') togglePause();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function exit() {
    if (!engine.state.over) void recorder.save(engine.stats()); // keep a run left early
    if (document.fullscreenElement) void document.exitFullscreen();
    navigate('/dashboard');
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stageRef.current?.requestFullscreen?.();
  }

  return (
    <section className="fade-in flex-1 flex flex-col items-center gap-3">
      <GameHeader
        meta={meta}
        score={hud.score}
        livesLabel={'♥'.repeat(Math.max(0, hud.lives))}
        comboLabel={`x${hud.combo}`}
        onExit={exit}
        onPause={togglePause}
      />

      <div ref={stageRef} className="game-stage relative" style={{ width: 'min(100%, calc(72vh * .7), 600px)' }}>
        <canvas
          ref={canvasRef}
          width={W * SCALE}
          height={H * SCALE}
          className="rounded-2xl border-[3px] border-[#0a0f2c] w-full"
          style={{ aspectRatio: '7 / 10', height: 'auto', boxShadow: '6px 6px 0 #0a0f2c' }}
          {...canvasProps}
        />
        <Button variant="secondary" className="absolute top-2 right-2 px-2 py-0.5 text-xs opacity-80" aria-label="Fullscreen" onClick={toggleFullscreen}>
          ⛶
        </Button>
        {paused && (
          <div className="absolute inset-0 rounded-2xl bg-[#0a0f2c]/80 flex flex-col items-center justify-center gap-4 fade-in">
            <DotText className="text-6xl text-white">II</DotText>
            <DotText as="h3" className="text-3xl text-white">PAUSED</DotText>
            <Button onClick={togglePause}>RESUME</Button>
          </div>
        )}
      </div>

      {children}
      <p className="text-xs text-white/90 text-center max-w-md">{controls}</p>

      {result && (
        <ResultModal
          meta={meta}
          stats={result}
          recorder={recorder}
          onPlayAgain={onPlayAgain}
          onHome={() => navigate('/dashboard')}
        />
      )}
    </section>
  );
}
