/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Refactored into pure engine + renderer + React glue for rubric theme #1.
 *
 * Why this exists: React glue only. It loads the ship sprite and turns arrow
 * keys and pointer position into steering calls on the engine.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActionGameShell } from '../shared/ActionGameShell';
import { SHIP_SVG, svgDataUri } from '../shared/assets';
import { toGameFraction } from '../shared/pointer';
import type { GameProps } from '../shared/props';
import { useAnswerQueue } from '../shared/useAnswerQueue';
import { StarScraperEngine } from './engine';
import type { StarScraperState } from './engine';
import { drawStarScraper } from './renderer';

const STEER_KEYS: Record<string, number> = { ArrowLeft: -1, a: -1, ArrowRight: 1, d: 1 };

export function StarScraperGame(props: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const answers = useAnswerQueue(props.meta.category);
  const [engine] = useState(() => new StarScraperEngine(answers));
  const [ship] = useState(() => {
    const image = new Image();
    image.src = svgDataUri(SHIP_SVG);
    return image;
  });

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, state: StarScraperState) => drawStarScraper(ctx, state, ship),
    [ship],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const delta = STEER_KEYS[event.key];
      if (!delta) return;
      event.preventDefault();
      engine.steer(delta);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [engine]);

  return (
    <ActionGameShell
      {...props}
      engine={engine}
      draw={draw}
      canvasRef={canvasRef}
      controls="← → / A D or drag on the track · P to pause"
      canvasProps={{
        onPointerDown: (e) => engine.steerTo(toGameFraction(e)),
        onPointerMove: (e) => engine.steerTo(toGameFraction(e)),
      }}
    />
  );
}
