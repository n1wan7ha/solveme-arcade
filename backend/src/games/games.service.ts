/**
 * Why this exists: serves the game catalogue. It rarely changes, so it is a
 * good fit for a five-minute cache.
 * Drafted with an LLM (Claude Code).
 */
import { Injectable } from '@nestjs/common';
import type { Game } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';

const GAMES_CACHE_KEY = 'games';
const GAMES_CACHE_TTL_SECONDS = 5 * 60;

@Injectable()
export class GamesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisService,
  ) {}

  async listGames(): Promise<Game[]> {
    const cached = await this.cache.getJson<Game[]>(GAMES_CACHE_KEY);
    if (cached) return cached;

    const games = await this.prisma.game.findMany({ orderBy: { name: 'asc' } });
    await this.cache.setJson(GAMES_CACHE_KEY, games, GAMES_CACHE_TTL_SECONDS);
    return games;
  }
}
