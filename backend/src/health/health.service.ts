/**
 * Why this exists: checks every dependency the app relies on, in parallel.
 * Only the database is critical: the app keeps working without Redis (cache
 * falls back to the database) or the Fish API (games fall back to random answers).
 * Drafted with an LLM (Claude Code).
 */
import { Injectable } from '@nestjs/common';
import { FishApiService } from '../fish-api/fish-api.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { RedisService } from '../redis/redis.service.js';

type CheckResult = 'up' | 'down';

export interface HealthReport {
  status: 'ok' | 'degraded' | 'down';
  checks: { database: CheckResult; redis: CheckResult; fishApi: CheckResult };
  uptimeSeconds: number;
}

const toResult = (ok: boolean): CheckResult => (ok ? 'up' : 'down');

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly fishApi: FishApiService,
  ) {}

  async check(): Promise<HealthReport> {
    const [database, redis, fishApi] = await Promise.all([
      this.pingDatabase(),
      this.redis.ping(),
      this.fishApi.ping(),
    ]);

    const status = !database ? 'down' : redis && fishApi ? 'ok' : 'degraded';
    return {
      status,
      checks: { database: toResult(database), redis: toResult(redis), fishApi: toResult(fishApi) },
      uptimeSeconds: Math.round(process.uptime()),
    };
  }

  private async pingDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
