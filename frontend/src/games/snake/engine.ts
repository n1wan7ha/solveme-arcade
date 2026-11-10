/**
 * Ported from solveme-arcade.html (student's original prototype, 2025).
 * Refactored into pure engine + renderer + React glue for rubric theme #1
 * (low coupling: engine knows nothing about React; high cohesion: all snake
 * logic lives here).
 *
 * The hidden Fish API answer decides bonus food: an answer divisible by 3
 * makes the next food a 3x bonus that disappears after 7 seconds.
 */
import type { AnswerSource } from '../shared/answers';
import { baseState, BaseEngine } from '../shared/engine';
import type { BaseState } from '../shared/engine';
import { between } from '../shared/math';
import type { Point } from '../shared/types';

export const COLS = 21;
export const ROWS = 30;
export const CELL = 20; // game units per grid cell
export const BONUS_LIFETIME = 7; // seconds
const LIVES = 3;
const COMBO_WINDOW = 5; // seconds between bites to keep a combo
const MAX_QUEUED_TURNS = 3;

export interface Food extends Point {
  bonus: boolean;
  bornAt: number; // state.time when it appeared
}

export interface SnakeState extends BaseState {
  snake: Point[]; // head first
  direction: Point;
  queuedTurns: Point[];
  grow: number;
  moveTimer: number; // ms since the last move
  food: Food;
  lastEatAt: number | null;
}

/** Milliseconds per move: starts at 210 and speeds up with each bite. */
export const moveInterval = (eaten: number) => Math.max(70, 210 - eaten * 3.5);

export class SnakeEngine extends BaseEngine<SnakeState> {
  private readonly answers: AnswerSource;

  constructor(answers: AnswerSource) {
    super(
      {
        ...baseState(LIVES, 2.2),
        snake: [], direction: { x: 1, y: 0 }, queuedTurns: [], grow: 0, moveTimer: 0,
        food: { x: 0, y: 0, bonus: false, bornAt: 0 }, lastEatAt: null,
      },
      0.03,
    );
    this.answers = answers;
    this.resetSnake();
  }

  protected update(dt: number): void {
    const s = this.state;
    if (s.countdown > 0) {
      s.countdown -= dt;
      return;
    }

    if (s.food.bonus && s.time - s.food.bornAt > BONUS_LIFETIME) this.placeFood();

    s.moveTimer += dt * 1000;
    const interval = moveInterval(s.correct);
    while (s.moveTimer >= interval && !s.over) {
      s.moveTimer -= interval;
      this.move();
    }

    if (s.lastEatAt !== null && s.time - s.lastEatAt > COMBO_WINDOW) s.combo = 1;
  }

  /** Arrow keys, swipes and the D-pad all end up here. */
  turn(dx: number, dy: number): void {
    const s = this.state;
    if (s.over || s.paused) return;
    const last = s.queuedTurns.at(-1) ?? s.direction;
    const same = dx === last.x && dy === last.y;
    const reverse = dx === -last.x && dy === -last.y;
    if (same || reverse || s.queuedTurns.length >= MAX_QUEUED_TURNS) return;
    s.queuedTurns.push({ x: dx, y: dy });
  }

  private move(): void {
    const s = this.state;
    s.direction = s.queuedTurns.shift() ?? s.direction;
    const head = s.snake[0];
    const next = { x: head.x + s.direction.x, y: head.y + s.direction.y };

    const hitWall = next.x < 0 || next.y < 0 || next.x >= COLS || next.y >= ROWS;
    // The tail moves away this step, so only the rest of the body counts.
    const hitSelf = s.snake.slice(0, -1).some((part) => part.x === next.x && part.y === next.y);
    if (hitWall || hitSelf) return this.crash(head);

    s.snake.unshift(next);
    if (next.x === s.food.x && next.y === s.food.y) this.eat(next);

    if (s.grow > 0) s.grow--;
    else s.snake.pop();
  }

  private crash(head: Point): void {
    const s = this.state;
    s.attempts++;
    s.lives--;
    s.flash = 0.5;
    s.shake = 0.4;
    s.combo = 1;
    this.burst(head.x * CELL + 10, head.y * CELL + 10, '#ef2b3a', 36, 6);
    this.sound({ kind: 'bad' });
    if (s.lives <= 0) return this.end();

    this.resetSnake();
    s.countdown = 1.2;
    this.showPop('OUCH!', 210, 300);
  }

  private eat(at: Point): void {
    const s = this.state;
    const bonus = s.food.bonus;
    const inTime = s.lastEatAt !== null && s.time - s.lastEatAt < COMBO_WINDOW;
    s.combo = inTime ? s.combo + 1 : 1;
    s.lastEatAt = s.time;
    s.maxCombo = Math.max(s.maxCombo, s.combo);

    const points = (bonus ? 30 : 10) * Math.min(s.combo, 5);
    s.score += points;
    s.correct++;
    s.attempts++;
    s.grow += bonus ? 2 : 1;
    this.showPop(`+${points}`, at.x * CELL + 10, at.y * CELL);
    this.burst(at.x * CELL + 10, at.y * CELL + 10, bonus ? '#1d4ed8' : '#ef2b3a', 16, 4);
    this.sound({ kind: 'good' });
    this.placeFood();
  }

  private resetSnake(): void {
    const s = this.state;
    s.snake = [{ x: 10, y: 15 }, { x: 9, y: 15 }, { x: 8, y: 15 }];
    s.direction = { x: 1, y: 0 };
    s.queuedTurns = [];
    s.grow = 0;
    s.moveTimer = 0;
    this.placeFood();
  }

  private placeFood(): void {
    const s = this.state;
    let x: number;
    let y: number;
    do {
      x = Math.floor(between(0, COLS));
      y = Math.floor(between(0, ROWS));
    } while (s.snake.some((part) => part.x === x && part.y === y));

    const answer = this.answers.take() ?? Math.floor(between(0, 10));
    s.food = { x, y, bonus: answer % 3 === 0 && s.correct > 1, bornAt: s.time };
  }
}
