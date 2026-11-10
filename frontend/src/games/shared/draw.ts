/**
 * Why this exists: canvas effects several renderers share. They draw only and
 * never change game state.
 * Ported from solveme-arcade.html (student's original prototype).
 */
import { H, W } from './math';
import type { Particle } from './types';

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[], shape: 'circle' | 'square' = 'circle'): void {
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    if (shape === 'square') {
      ctx.fillRect(p.x, p.y, p.r * 1.5, p.r * 1.5);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

/** Darkens the corners so the middle of the screen stands out. */
export function drawVignette(ctx: CanvasRenderingContext2D, strength: number): void {
  const gradient = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.8);
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
}

/** The red screen flash when the player is hit. */
export function drawFlash(ctx: CanvasRenderingContext2D, alpha: number, rgb = '239,68,68'): void {
  if (alpha <= 0) return;
  ctx.fillStyle = `rgba(${rgb},${alpha})`;
  ctx.fillRect(0, 0, W, H);
}

/** "3, 2, 1, GO" over a dark overlay. The number grows within each second. */
export function drawCountdown(ctx: CanvasRenderingContext2D, countdown: number, goText: string): void {
  if (countdown <= 0) return;
  const n = Math.ceil(countdown - 0.4);
  ctx.fillStyle = 'rgba(2,6,23,.45)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${90 + (countdown % 1) * 40}px sans-serif`;
  ctx.fillText(n > 0 ? String(n) : goText, W / 2, H / 2);
}
