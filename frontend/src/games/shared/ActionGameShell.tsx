/**
 * Why this exists: everything the three canvas games share on screen: the
 * arcade cabinet, the CRT stage, pause overlay, fullscreen, the game loop, and
 * saving the run when the engine reports game over. Each game passes in its
 * engine, renderer and input handlers.
 * Drafted with an LLM (Claude Code), from the prototype's v-play section.
 */
import { useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode, RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { ArcadeCabinet } from './ArcadeCabinet';
import { play } from './audio';
import type { BaseEngine, BaseState } from './engine';
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
  children?: ReactNode; // extra on-screen controls, e.g. Snake's D-pad
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
  const hiScore = Math.max(0, ...recorder.history.filter((r) => r.gameId === meta.slug).map((r) => r.score));

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

  const screen = (
    <div ref={stageRef} className="game-stage screen crt stage-portrait">
      <canvas
        ref={canvasRef}
        width={W * SCALE}
        height={H * SCALE}
        className="block w-full"
        style={{ aspectRatio: '7 / 10', height: 'auto' }}
        {...canvasProps}
      />
      {paused && (
        <div className="absolute inset-0 z-[4] bg-[#03020c]/80 flex flex-col items-center justify-center gap-6 fade-in">
          <div className="pixel text-5xl neon-cyan">II</div>
          <h3 className="pixel text-2xl neon-yellow">PAUSED</h3>
          <Button onClick={togglePause}>▶ RESUME</Button>
          <p className="pixel text-[0.55rem] muted blink">PRESS P TO CONTINUE</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <ArcadeCabinet
        meta={meta}
        score={hud.score}
        hiScore={hiScore}
        status={{ label: 'LIVES', value: '♥'.repeat(Math.max(0, hud.lives)) }}
        combo={`x${hud.combo}`}
        onExit={exit}
        onPause={togglePause}
        onFullscreen={toggleFullscreen}
        screen={screen}
        pad={children}
        controls={controls}
      />

      {result && (
        <ResultModal
          meta={meta}
          stats={result}
          recorder={recorder}
          onPlayAgain={onPlayAgain}
          onHome={() => navigate('/dashboard')}
        />
      )}
    </>
  );
}
