/**
 * Why this exists: owns every rule about finished games: saving a run, a
 * player's history, and how the leaderboard is calculated and cached.
 * Drafted with an LLM (Claude Code).
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import type { Run } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';
import type { CreateRunDto } from './dto/create-run.dto.js';
import type { LeaderboardEntry } from './interfaces/leaderboard-entry.interface.js';
import { ALL_GAMES, RUN_CREATED } from './scores.events.js';
import type { RunCreatedEvent } from './scores.events.js';

const LEADERBOARD_SIZE = 100;
const LEADERBOARD_CACHE_TTL_SECONDS = 30;

// Prisma's error code for a foreign key that points at nothing.
const FOREIGN_KEY_VIOLATION = 'P2003';

@Injectable()
export class RunsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisService,
    private readonly events: EventEmitter2,
  ) {}

  async createRun(
    userId: string,
    gameId: string,
    dto: CreateRunDto,
  ): Promise<Run> {
    try {
      const { user, ...run } = await this.prisma.run.create({
        data: { ...dto, startedAt: new Date(dto.startedAt), userId, gameId },
        include: { user: { select: { username: true } } },
      });

      // A new score makes both of these out of date.
      await this.cache.delete(
        this.leaderboardKey(gameId),
        this.leaderboardKey(ALL_GAMES),
      );

      // Emitted here so runs saved over REST and WebSocket behave the same.
      const event: RunCreatedEvent = { run, username: user.username };
      this.events.emit(RUN_CREATED, event);
      return run;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === FOREIGN_KEY_VIOLATION
      ) {
        throw new NotFoundException(`Game "${gameId}" does not exist`);
      }
      throw error;
    }
  }

  listUserRuns(userId: string): Promise<Run[]> {
    return this.prisma.run.findMany({
      where: { userId },
      orderBy: { finishedAt: 'desc' },
    });
  }

  async leaderboard(gameId: string): Promise<LeaderboardEntry[]> {
    const key = this.leaderboardKey(gameId);
    const cached = await this.cache.getJson<LeaderboardEntry[]>(key);
    if (cached) return cached;

    const totals =
      gameId === ALL_GAMES
        ? await this.totalScorePerUser()
        : await this.bestScorePerUser(gameId);
    const entries = await this.withUsernames(totals);

    await this.cache.setJson(key, entries, LEADERBOARD_CACHE_TTL_SECONDS);
    return entries;
  }

  /** Single-game ranking: each player's best run. */
  private async bestScorePerUser(gameId: string) {
    const rows = await this.prisma.run.groupBy({
      by: ['userId'],
      where: { gameId },
      _max: { score: true },
      orderBy: [{ _max: { score: 'desc' } }, { userId: 'asc' }],
      take: LEADERBOARD_SIZE,
    });
    return rows.map((row) => ({
      userId: row.userId,
      score: row._max.score ?? 0,
    }));
  }

  /** All-games ranking: every point a player has earned. */
  private async totalScorePerUser() {
    const rows = await this.prisma.run.groupBy({
      by: ['userId'],
      _sum: { score: true },
      orderBy: [{ _sum: { score: 'desc' } }, { userId: 'asc' }],
      take: LEADERBOARD_SIZE,
    });
    return rows.map((row) => ({
      userId: row.userId,
      score: row._sum.score ?? 0,
    }));
  }

  /** Signs the high-score table; cached boards must be rebuilt to show it. */
  async setInitials(userId: string, initials: string): Promise<{ initials: string }> {
    await this.prisma.user.update({ where: { id: userId }, data: { initials } });
    const games = await this.prisma.game.findMany({ select: { id: true } });
    await this.cache.delete(
      this.leaderboardKey(ALL_GAMES),
      ...games.map((game) => this.leaderboardKey(game.id)),
    );
    return { initials };
  }

  private async withUsernames(
    rows: { userId: string; score: number }[],
  ): Promise<LeaderboardEntry[]> {
    const users = await this.prisma.user.findMany({
      where: { id: { in: rows.map((row) => row.userId) } },
      select: { id: true, username: true, initials: true },
    });
    const userById = new Map(users.map((u) => [u.id, u]));

    return rows.map((row, index) => ({
      rank: index + 1,
      username: userById.get(row.userId)?.username ?? 'unknown',
      initials: userById.get(row.userId)?.initials ?? null,
      score: row.score,
    }));
  }

  private leaderboardKey(gameId: string): string {
    return `leaderboard:${gameId}`;
  }
}
