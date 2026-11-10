/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Refactored into pure engine + renderer + React glue for rubric theme #1
 * (low coupling: engine knows nothing about React; high cohesion: all Fruit
 * Slash logic lives here).
 *
 * The hidden Fish API answer decides each wave: (answer mod n) picks the
 * golden pineapple, and from wave 4 the bomb sits two places after it.
 */
import type { AnswerSource } from '../shared/answers';
import { FRUIT_JUICE, FRUITS, GOLDEN_FRUIT, BOMB } from '../shared/assets';
import { baseState, BaseEngine } from '../shared/engine';
import type { BaseState } from '../shared/engine';
import { between, clamp, H, W } from '../shared/math';
import type { Point } from '../shared/types';

const LIVES = 3;
const ITEM_RADIUS = 36;
const SLICE_TOLERANCE = 8;
const TRAIL_LENGTH = 14;

export type ItemKind = 'fruit' | 'gold' | 'bomb';

export interface FlyingItem extends Point {
  vx: number;
  vy: number;
  gravity: number;
  rotation: number;
  spin: number;
  r: number;
  kind: ItemKind;
  emoji: string;
  delay: number; // seconds before it is launched
  sliced: boolean;
  out: boolean; // fell off the bottom
}

/** One half of a sliced fruit, falling away. */
export interface Half extends Point {
  emoji: string;
  vx: number;
  vy: number;
  gravity: number;
  rotation: number;
  spin: number;
  side: -1 | 1;
}

export interface TrailPoint extends Point {
  life: number;
}

export interface Leaf extends Point {
  speed: number;
  size: number;
}

export interface FruitSlashState extends BaseState {
  items: FlyingItem[];
  halves: Half[];
  trail: TrailPoint[];
  leaves: Leaf[];
  wave: number;
  spawnTimer: number;
  swiping: boolean;
  swipeHits: number; // fruit cut in the current swipe
  lastPoint: Point | null;
}

export class FruitSlashEngine extends BaseEngine<FruitSlashState> {
  private readonly answers: AnswerSource;

  constructor(answers: AnswerSource) {
    super(
      {
        ...baseState(LIVES, 3.4),
        items: [], halves: [], trail: [], wave: 0, spawnTimer: 0.4,
        swiping: false, swipeHits: 0, lastPoint: null,
        leaves: Array.from({ length: 18 }, () => ({
          x: between(0, W), y: between(0, H), speed: between(0.3, 1), size: between(3, 7),
        })),
      },
      0.025,
    );
    this.answers = answers;
  }

  protected update(dt: number): void {
    const s = this.state;
    const k = dt * 60;

    for (const point of s.trail) point.life -= dt * 3.5;
    s.trail = s.trail.filter((point) => point.life > 0);

    for (const leaf of s.leaves) {
      leaf.y += leaf.speed * k;
      leaf.x += Math.sin(s.time * 2 + leaf.y * 0.02) * 0.6 * k;
      if (leaf.y > H) leaf.y = -10;
    }

    if (s.countdown > 0) {
      s.countdown -= dt;
      return;
    }

    s.spawnTimer -= dt;
    if (s.spawnTimer <= 0) {
      const answer = this.answers.take();
      if (answer !== undefined) this.launchWave(answer);
    }

    for (const item of s.items) {
      if (item.delay > 0) {
        item.delay -= dt;
        continue;
      }
      item.x += item.vx * k;
      item.y += item.vy * k;
      item.vy += item.gravity * k;
      item.rotation += item.spin * k;

      const fellOff = item.y > H + 50 && item.vy > 0 && !item.sliced && !item.out;
      if (fellOff) {
        item.out = true;
        if (item.kind === 'fruit') {
          s.lives--;
          s.combo = 1;
          s.attempts++;
          s.flash = 0.25;
          this.showPop('Missed!', clamp(item.x, 50, W - 50), H - 70);
          this.sound({ kind: 'bad' });
          if (s.lives <= 0) return this.end();
        }
      }
    }
    s.items = s.items.filter((item) => !(item.sliced || item.out));

    for (const half of s.halves) {
      half.x += half.vx * k;
      half.y += half.vy * k;
      half.vy += half.gravity * k;
      half.rotation += half.spin * k;
    }
    s.halves = s.halves.filter((half) => half.y < H + 80);
  }

  startSwipe(p: Point): void {
    const s = this.state;
    s.swiping = true;
    s.swipeHits = 0;
    s.lastPoint = p;
    s.trail = [{ ...p, life: 1 }];
    this.sliceSegment(p, p);
  }

  moveSwipe(p: Point): void {
    const s = this.state;
    if (!s.swiping || !s.lastPoint) return;
    this.sliceSegment(s.lastPoint, p);
    s.trail.push({ ...p, life: 1 });
    if (s.trail.length > TRAIL_LENGTH) s.trail.shift();
    s.lastPoint = p;
  }

  endSwipe(): void {
    this.state.swiping = false;
    this.state.swipeHits = 0;
  }

  /** Waves start with 3 items and grow to 5; they launch faster as you go. */
  private launchWave(answer: number): void {
    const s = this.state;
    const w = s.wave;
    const n = w < 3 ? 3 : w < 8 ? 4 : 5;
    const goldIndex = ((answer % n) + n) % n;
    const bombIndex = w < 4 ? -1 : (goldIndex + 2) % n;
    const gravity = 0.28 + Math.min(0.1, w * 0.004);
    s.spawnTimer = Math.max(1.5, 3.6 - w * 0.07);
    s.wave++;

    for (let i = 0; i < n; i++) {
      const kind: ItemKind = i === goldIndex ? 'gold' : i === bombIndex ? 'bomb' : 'fruit';
      const x = 70 + (i * (W - 140)) / (n - 1);
      s.items.push({
        x, y: H + 40,
        vx: (W / 2 - x) * 0.012 + between(-0.6, 0.6),
        vy: -Math.sqrt(2 * gravity * between(430, 490)), // enough to reach near the top
        gravity, rotation: 0, spin: between(-0.08, 0.08), r: ITEM_RADIUS, kind,
        emoji: kind === 'gold' ? GOLDEN_FRUIT : kind === 'bomb' ? BOMB : FRUITS[Math.floor(between(0, FRUITS.length))],
        delay: i * 0.18, sliced: false, out: false,
      });
    }
  }

  /** Hits every item whose circle the swipe segment a→b passes through. */
  private sliceSegment(a: Point, b: Point): void {
    const s = this.state;
    if (s.over || s.paused || s.countdown > 0) return;

    for (const item of s.items) {
      if (item.sliced || item.delay > 0) continue;
      // Closest point on the segment to the item's centre
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const lengthSq = dx * dx + dy * dy || 1;
      const t = clamp(((item.x - a.x) * dx + (item.y - a.y) * dy) / lengthSq, 0, 1);
      const px = a.x + t * dx - item.x;
      const py = a.y + t * dy - item.y;
      if (px * px + py * py <= (item.r + SLICE_TOLERANCE) ** 2) this.hit(item);
    }
  }

  private hit(item: FlyingItem): void {
    const s = this.state;
    item.sliced = true;

    if (item.kind === 'bomb') {
      s.lives--;
      s.combo = 1;
      s.attempts++;
      s.flash = 0.5;
      s.shake = 0.4;
      this.showPop('BOOM!', item.x, item.y);
      this.burst(item.x, item.y, '#fb923c', 50, 8);
      this.sound({ kind: 'bad' });
      if (s.lives <= 0) this.end();
      return;
    }

    const gold = item.kind === 'gold';
    const points = (gold ? 50 : 10) * Math.min(s.combo, 5);
    s.score += points;
    s.correct++;
    s.attempts++;
    s.combo++;
    s.maxCombo = Math.max(s.maxCombo, s.combo);
    s.swipeHits++;
    const multi = s.swipeHits >= 3;
    if (multi) s.score += 5; // three or more in one swipe
    this.showPop(`+${points}${multi ? ' Multi!' : ''}`, item.x, item.y);

    for (const side of [-1, 1] as const) {
      s.halves.push({
        emoji: item.emoji, x: item.x, y: item.y,
        vx: item.vx + side * between(1.5, 3), vy: item.vy * 0.3, gravity: item.gravity,
        rotation: item.rotation, spin: side * between(0.05, 0.15), side,
      });
    }
    this.burst(item.x, item.y, gold ? '#fde047' : FRUIT_JUICE[item.emoji] ?? '#fff', gold ? 36 : 20, gold ? 8 : 5);
    this.sound(gold ? { kind: 'gold' } : { kind: 'slice', combo: s.combo });
  }
}
