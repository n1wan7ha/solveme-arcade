/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Refactored into pure engine + renderer + React glue for rubric theme #1
 * (low coupling: the renderer only reads state; high cohesion: all Star
 * Scraper drawing lives here).
 */
import { drawCountdown, drawFlash, drawParticles, drawVignette } from '../shared/draw';
import { between, clamp, H, W } from '../shared/math';
import { LANE_WIDTH, LANES, PLAYER_Y, SHIP_HEIGHT, SHIP_WIDTH, speedLevel } from './engine';
import type { Gate, StarScraperState } from './engine';

export function drawStarScraper(ctx: CanvasRenderingContext2D, s: StarScraperState, ship: HTMLImageElement): void {
  const t = s.time;
  ctx.save();
  if (s.shake > 0) ctx.translate(between(-6, 6), between(-6, 6));

  drawSpace(ctx, s);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const gate of s.gates) drawGate(ctx, gate, t);
  drawParticles(ctx, s.particles);
  drawShip(ctx, s, ship, t);

  if (s.pop) {
    ctx.globalAlpha = s.pop.alpha;
    ctx.fillStyle = s.pop.text === 'CRASH!' ? '#fb7185' : '#fde047';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(s.pop.text, s.pop.x, s.pop.y - (1 - s.pop.alpha) * 50);
    ctx.globalAlpha = 1;
  }

  drawVignette(ctx, 0.55);
  drawFlash(ctx, s.flash);

  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,.8)';
  ctx.font = 'bold 12px sans-serif';
  const speed = Math.round(speedLevel(s.attempts) * 10) / 10;
  ctx.fillText(`${'♥'.repeat(Math.max(0, s.lives))}   SPEED ${speed}   GATE ${s.attempts + 1}`, 14, 22);
  ctx.textAlign = 'center';

  drawCountdown(ctx, s.countdown, 'GO!');
  ctx.restore();
}

/** Deep-space gradient, a drifting planet, stars and dashed lane lines. */
function drawSpace(ctx: CanvasRenderingContext2D, s: StarScraperState): void {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#05071a');
  sky.addColorStop(1, '#12083a');
  ctx.fillStyle = sky;
  ctx.fillRect(-9, -9, W + 18, H + 18);

  const planet = ctx.createRadialGradient(W * 0.75, s.planetY, 10, W * 0.75, s.planetY, 130);
  planet.addColorStop(0, '#fb923c');
  planet.addColorStop(0.7, '#9a3412');
  planet.addColorStop(1, 'rgba(154,52,18,0)');
  ctx.fillStyle = planet;
  ctx.beginPath();
  ctx.arc(W * 0.75, s.planetY, 130, 0, Math.PI * 2);
  ctx.fill();

  // Stars stretch into streaks once the combo reaches x3
  ctx.fillStyle = '#fff';
  for (const star of s.stars) {
    ctx.globalAlpha = 0.4 + star.depth / 3;
    const size = star.depth * 1.6;
    ctx.fillRect(star.x, star.y, size, size + (s.combo >= 3 ? star.depth * 5 : 0));
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = 'rgba(255,255,255,.22)';
  ctx.lineWidth = 2;
  ctx.setLineDash([16, 24]);
  ctx.lineDashOffset = -s.road;
  for (let i = 1; i < LANES; i++) {
    ctx.beginPath();
    ctx.moveTo(i * LANE_WIDTH, 0);
    ctx.lineTo(i * LANE_WIDTH, H);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

/** A wall of asteroids with one glowing green safe lane. */
function drawGate(ctx: CanvasRenderingContext2D, gate: Gate, t: number): void {
  for (let lane = 0; lane < LANES; lane++) {
    const x = lane * LANE_WIDTH + LANE_WIDTH / 2;
    const y = gate.y;

    if (lane === gate.safeLane) {
      const glow = 0.55 + 0.3 * Math.sin(t * 8);
      ctx.shadowBlur = 22;
      ctx.shadowColor = '#34d399';
      ctx.fillStyle = `rgba(52,211,153,${glow * 0.35})`;
      ctx.fillRect(lane * LANE_WIDTH + 3, y - 34, LANE_WIDTH - 6, 68);
      ctx.fillStyle = `rgba(110,231,183,${glow + 0.2})`;
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('▲', x, y + 8 * Math.sin(t * 10));
      ctx.fillText('▲', x, y - 16 + 8 * Math.sin(t * 10));
      ctx.shadowBlur = 0;
      continue;
    }

    const r = LANE_WIDTH * 0.42;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(gate.rotation[lane] + y * 0.012 * (lane % 2 ? 1 : -1));
    ctx.beginPath();
    gate.jagged[lane].forEach((factor, i) => {
      const angle = (i / 9) * Math.PI * 2;
      const px = Math.cos(angle) * r * factor;
      const py = Math.sin(angle) * r * factor;
      if (i) ctx.lineTo(px, py);
      else ctx.moveTo(px, py);
    });
    ctx.closePath();
    const rock = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r);
    rock.addColorStop(0, '#a8a29e');
    rock.addColorStop(1, '#44403c');
    ctx.fillStyle = rock;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#f97316';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; // craters
    ctx.beginPath();
    ctx.arc(-r * 0.25, r * 0.1, r * 0.2, 0, Math.PI * 2);
    ctx.arc(r * 0.3, -r * 0.25, r * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/** The ship tilts towards its target lane, with a flickering flame. */
function drawShip(ctx: CanvasRenderingContext2D, s: StarScraperState, ship: HTMLImageElement, t: number): void {
  ctx.save();
  ctx.translate(s.shipX, PLAYER_Y);
  ctx.rotate(clamp((s.targetLane * LANE_WIDTH + LANE_WIDTH / 2 - s.shipX) * 0.006, -0.3, 0.3));

  const flameLength = (s.combo >= 5 ? 30 : 18) + between(0, 16);
  const flame = ctx.createLinearGradient(0, SHIP_HEIGHT / 2 - 6, 0, SHIP_HEIGHT / 2 + flameLength);
  flame.addColorStop(0, '#fde047');
  flame.addColorStop(1, 'rgba(249,115,22,0)');
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.moveTo(-9, SHIP_HEIGHT / 2 - 6);
  ctx.lineTo(9, SHIP_HEIGHT / 2 - 6);
  ctx.lineTo(0, SHIP_HEIGHT / 2 + flameLength);
  ctx.fill();

  if (s.combo >= 5) {
    ctx.strokeStyle = `rgba(103,232,249,${0.5 + 0.3 * Math.sin(t * 10)})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.shadowBlur = 18;
  ctx.shadowColor = '#818cf8';
  ctx.drawImage(ship, -SHIP_WIDTH / 2, -SHIP_HEIGHT / 2, SHIP_WIDTH, SHIP_HEIGHT);
  ctx.restore();
}
