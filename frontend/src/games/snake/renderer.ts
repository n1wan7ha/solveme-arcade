/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Refactored into pure engine + renderer + React glue for rubric theme #1
 * (low coupling: the renderer only reads state; high cohesion: all snake
 * drawing lives here).
 */
import { drawFlash, drawParticles } from '../shared/draw';
import { between, H, W } from '../shared/math';
import { BONUS_LIFETIME, CELL, COLS, moveInterval, ROWS } from './engine';
import type { SnakeState } from './engine';

export function drawSnake(ctx: CanvasRenderingContext2D, s: SnakeState): void {
  const t = s.time;
  ctx.save();
  if (s.shake > 0) ctx.translate(between(-5, 5), between(-5, 5));

  // Board with a dotted grid
  ctx.fillStyle = '#f4f7ff';
  ctx.fillRect(-9, -9, W + 18, H + 18);
  ctx.fillStyle = 'rgba(29,78,216,.3)';
  for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) ctx.fillRect(x * CELL + 9, y * CELL + 9, 2, 2);

  drawFood(ctx, s, t);

  // Snake: dark head with eyes, striped blue body
  s.snake.forEach((part, i) => {
    const x = part.x * CELL;
    const y = part.y * CELL;
    ctx.fillStyle = i ? (i % 2 ? '#1d4ed8' : '#2f62f0') : '#0a0f2c';
    ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
    ctx.fillStyle = i ? 'rgba(255,255,255,.35)' : '#fff';
    ctx.fillRect(x + 4, y + 4, 4, 4);
    if (!i) ctx.fillRect(x + 12, y + 4, 4, 4);
  });

  drawParticles(ctx, s.particles, 'square');

  // Frame and status line
  ctx.strokeStyle = '#0a0f2c';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, W - 4, H - 4);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0a0f2c';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(`LEN ${s.snake.length}  SPEED ${Math.round((300 - moveInterval(s.correct)) / 10)}`, 10, H - 9);
  ctx.textAlign = 'center';

  if (s.pop) {
    ctx.globalAlpha = s.pop.alpha;
    ctx.fillStyle = '#ef2b3a';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(s.pop.text, s.pop.x, s.pop.y - 10 - (1 - s.pop.alpha) * 40);
    ctx.globalAlpha = 1;
  }

  drawFlash(ctx, s.flash, '239,43,58');

  if (s.countdown > 0) {
    const n = Math.ceil(s.countdown - 0.2);
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1d4ed8';
    ctx.font = `bold ${70 + (s.countdown % 1) * 30}px monospace`;
    ctx.textBaseline = 'middle';
    ctx.fillText(n > 0 ? String(n) : 'GO', W / 2, H / 2);
    ctx.textBaseline = 'alphabetic';
  }
  ctx.restore();
}

function drawFood(ctx: CanvasRenderingContext2D, s: SnakeState, t: number): void {
  const { food } = s;
  const fx = food.x * CELL;
  const fy = food.y * CELL;
  ctx.fillStyle = '#ef2b3a';

  if (food.bonus) {
    // Pulsing plus sign with a shrinking timer bar underneath
    const pulse = 1 + 0.12 * Math.sin(t * 8);
    const timeLeft = 1 - (t - food.bornAt) / BONUS_LIFETIME;
    ctx.save();
    ctx.translate(fx + 10, fy + 10);
    ctx.scale(pulse, pulse);
    ctx.fillRect(-9, -3, 18, 6);
    ctx.fillRect(-3, -9, 6, 18);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();
    ctx.fillStyle = '#0a0f2c';
    ctx.fillRect(fx, fy + 18, CELL * Math.max(0, timeLeft), 2);
  } else {
    // Pixel apple
    ctx.fillRect(fx + 3, fy + 5, 14, 12);
    ctx.fillRect(fx + 5, fy + 3, 10, 2);
    ctx.fillStyle = '#fff';
    ctx.fillRect(fx + 5, fy + 7, 3, 3);
    ctx.fillStyle = '#0a0f2c';
    ctx.fillRect(fx + 9, fy + 1, 2, 3);
  }
}
