/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Refactored into pure engine + renderer + React glue for rubric theme #1
 * (low coupling: engine knows nothing about React; high cohesion: all Star
 * Scraper logic lives here).
 *
 * Asteroid walls scroll down with one safe lane each. The hidden Fish API
 * answer picks the safe lane (answer mod 7).
 */
import type { AnswerSource } from '../shared/answers';
import { baseState, BaseEngine } from '../shared/engine';
import type { BaseState } from '../shared/engine';
import { between, clamp, H, W } from '../shared/math';
import type { Point } from '../shared/types';

export const LANES = 7;
export const LANE_WIDTH = W / LANES;
export const PLAYER_Y = 500;
export const SHIP_WIDTH = 46;
export const SHIP_HEIGHT = 78;
const LIVES = 3;
const BASE_SPEED = 3;
const SPEED_RAMP = 0.14; // extra speed per gate
const GATE_GAP = 250; // a new wall appears once the last one is this far down

export interface Gate {
  y: number;
  safeLane: number;
  passed: boolean;
  rotation: number[]; // per lane, so each asteroid looks different
  jagged: number[][]; // per lane, 9 radius factors for the rock outline
}

export interface Star extends Point {
  depth: number;
}

export interface StarScraperState extends BaseState {
  shipX: number;
  targetLane: number;
  road: number; // scroll offset for the lane markings
  speed: number; // distance moved this frame
  planetY: number;
  gates: Gate[];
  stars: Star[];
}

/** Shown in the HUD; rises with every gate. */
export const speedLevel = (gatesPassed: number) => BASE_SPEED + SPEED_RAMP * gatesPassed;

export class StarScraperEngine extends BaseEngine<StarScraperState> {
  private readonly answers: AnswerSource;

  constructor(answers: AnswerSource) {
    const startLane = Math.floor(LANES / 2);
    super(
      {
        ...baseState(LIVES, 3.4),
        shipX: (startLane + 0.5) * LANE_WIDTH, targetLane: startLane,
        road: 0, speed: 0, planetY: -150, gates: [],
        stars: Array.from({ length: 90 }, () => ({ x: between(0, W), y: between(0, H), depth: between(0.3, 1.6) })),
      },
      0.02,
    );
    this.answers = answers;
  }

  protected update(dt: number): void {
    const s = this.state;
    const boost = s.combo >= 5 ? 1.25 : 1; // a x5 combo flies faster
    s.speed = speedLevel(s.attempts) * 60 * dt * boost;
    // Glide towards the chosen lane rather than jumping
    s.shipX += (s.targetLane * LANE_WIDTH + LANE_WIDTH / 2 - s.shipX) * Math.min(1, dt * 14);

    if (s.countdown > 0) {
      s.countdown -= dt;
      s.speed = 1.5;
      s.road = (s.road + 1) % 40;
      this.moveScenery(dt);
      return;
    }

    s.road = (s.road + s.speed) % 40;
    this.spawnGate();

    for (const gate of s.gates) {
      gate.y += s.speed;
      if (!gate.passed && gate.y >= PLAYER_Y - 34) {
        gate.passed = true;
        this.resolveGate(gate);
        if (s.lives <= 0) return this.end();
      }
    }
    s.gates = s.gates.filter((gate) => gate.y < H + 70);

    // Engine exhaust
    s.particles.push({
      x: s.shipX + between(-6, 6), y: PLAYER_Y + SHIP_HEIGHT / 2 - 8,
      vx: between(-0.4, 0.4), vy: between(2, 4), life: 0.7,
      color: '#fdba74', r: between(2, s.combo >= 5 ? 6 : 4),
    });
    this.moveScenery(dt);
  }

  /** Mouse or touch: steer to the lane under the pointer (0 to 1 across). */
  steerTo(fraction: number): void {
    if (this.state.over) return;
    this.state.targetLane = clamp(Math.floor(fraction * LANES), 0, LANES - 1);
  }

  /** Keyboard: one lane left (-1) or right (+1). */
  steer(delta: number): void {
    const s = this.state;
    if (s.over || s.paused) return;
    s.targetLane = clamp(s.targetLane + delta, 0, LANES - 1);
  }

  private currentLane(): number {
    return clamp(Math.floor(this.state.shipX / LANE_WIDTH), 0, LANES - 1);
  }

  private spawnGate(): void {
    const s = this.state;
    const last = s.gates.at(-1);
    if (last && last.y <= GATE_GAP) return;
    const answer = this.answers.take();
    if (answer === undefined) return; // wait for the next hidden answer
    s.gates.push({
      y: -40,
      safeLane: ((answer % LANES) + LANES) % LANES,
      passed: false,
      rotation: Array.from({ length: LANES }, () => between(0, 6)),
      jagged: Array.from({ length: LANES }, () => Array.from({ length: 9 }, () => between(0.75, 1.1))),
    });
  }

  private resolveGate(gate: Gate): void {
    const s = this.state;
    const x = s.shipX;
    s.attempts++;
    if (this.currentLane() === gate.safeLane) {
      const points = 10 * Math.min(s.combo, 5);
      s.score += points;
      s.correct++;
      this.showPop(`+${points}`, x, PLAYER_Y - 60);
      s.combo++;
      s.maxCombo = Math.max(s.maxCombo, s.combo);
      this.burst(x, PLAYER_Y - 20, '#34d399', 22, 5);
      this.sound({ kind: 'good' });
    } else {
      s.combo = 1;
      s.shake = 0.4;
      s.flash = 0.45;
      s.lives--;
      this.showPop('CRASH!', x, PLAYER_Y - 60);
      this.burst(x, PLAYER_Y, '#fb923c', 44, 7);
      this.sound({ kind: 'bad' });
    }
  }

  /** Background planet and stars drift down at a fraction of the ship's speed. */
  private moveScenery(dt: number): void {
    const s = this.state;
    s.planetY += s.speed * 0.15;
    if (s.planetY > H + 200) s.planetY = -260;
    for (const star of s.stars) {
      star.y += s.speed * star.depth * 0.8 + 0.3 * dt * 60;
      if (star.y > H) {
        star.y = -4;
        star.x = between(0, W);
      }
    }
  }
}
