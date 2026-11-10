/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Refactored into pure engine + renderer + React glue for rubric theme #1
 * (low coupling: the renderer only reads state; high cohesion: all Fruit
 * Slash drawing lives here).
 */
import { drawCountdown, drawFlash, drawParticles, drawVignette } from '../shared/draw';
import { between, H, W } from '../shared/math';
import type { FruitSlashState } from './engine';

const EMOJI_FONT = '62px serif';

export function drawFruitSlash(ctx: CanvasRenderingContext2D, s: FruitSlashState): void {
  const t = s.time;
  ctx.save();
  if (s.shake > 0) ctx.translate(between(-6, 6), between(-6, 6));

  drawJungle(ctx, s, t);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Sliced halves: each is the emoji clipped to its left or right side
  for (const half of s.halves) {
    ctx.save();
    ctx.translate(half.x, half.y);
    ctx.rotate(half.rotation);
    ctx.beginPath();
    ctx.rect(half.side < 0 ? -42 : 0, -42, 42, 84);
    ctx.clip();
    ctx.font = EMOJI_FONT;
    ctx.globalAlpha = Math.max(0, 1 - (half.y - H * 0.55) / (H * 0.5));
    ctx.fillText(half.emoji, 0, 3);
    ctx.restore();
  }

  for (const item of s.items) {
    if (item.delay > 0) continue;
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rotation);
    if (item.kind === 'gold') {
      ctx.shadowBlur = 26;
      ctx.shadowColor = '#fde047';
      ctx.strokeStyle = `rgba(253,224,71,${0.5 + 0.4 * Math.sin(t * 10)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, item.r + 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (item.kind === 'bomb') {
      ctx.shadowBlur = 14;
      ctx.shadowColor = '#ef4444';
    }
    ctx.font = EMOJI_FONT;
    ctx.fillText(item.emoji, 0, 3);
    ctx.restore();
  }

  drawParticles(ctx, s.particles);

  // Blade trail, thicker where it is newest
  ctx.lineCap = 'round';
  for (let i = 1; i < s.trail.length; i++) {
    const a = s.trail[i - 1];
    const b = s.trail[i];
    ctx.strokeStyle = `rgba(186,230,253,${Math.max(0, b.life)})`;
    ctx.lineWidth = 2 + 9 * b.life;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#67e8f9';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  if (s.pop) {
    ctx.globalAlpha = s.pop.alpha;
    ctx.fillStyle = /BOOM|Missed/.test(s.pop.text) ? '#fb7185' : '#fde047';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(s.pop.text, s.pop.x, s.pop.y - 30 - (1 - s.pop.alpha) * 50);
    ctx.globalAlpha = 1;
  }

  drawVignette(ctx, 0.5);

  // Hearts and wave number
  ctx.textAlign = 'left';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#fb7185';
  const lives = Math.max(0, s.lives);
  ctx.fillText('♥'.repeat(lives) + '♡'.repeat(s.maxLives - lives), 14, 28);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`WAVE ${s.wave || 1}`, W - 14, 26);
  ctx.textAlign = 'center';

  drawFlash(ctx, s.flash);
  drawCountdown(ctx, s.countdown, 'SLICE!');
  ctx.restore();
}

/** Dark green gradient, swaying bamboo and drifting leaves. */
function drawJungle(ctx: CanvasRenderingContext2D, s: FruitSlashState, t: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#052e2b');
  sky.addColorStop(1, '#14301a');
  ctx.fillStyle = sky;
  ctx.fillRect(-9, -9, W + 18, H + 18);

  for (let i = 0; i < 7; i++) {
    const x = 30 + i * 60 + Math.sin(t + i) * 4;
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = i % 2 ? '#166534' : '#15803d';
    ctx.fillRect(x, 0, 14, H);
    ctx.fillStyle = '#052e16';
    for (let y = (i * 53) % 90; y < H; y += 90) ctx.fillRect(x - 2, y, 18, 5);
  }

  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#86efac';
  for (const leaf of s.leaves) {
    ctx.beginPath();
    ctx.ellipse(leaf.x, leaf.y, leaf.size, leaf.size / 2, t, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
