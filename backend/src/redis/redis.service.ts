/**
 * Why this exists: a small JSON cache over Redis, so other modules never touch
 * the Redis client. A cache is optional by nature, so if Redis fails these
 * methods log a warning and the caller falls back to the database.
 * Drafted with an LLM (Claude Code).
 */
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(config: ConfigService) {
    this.client = new Redis(config.getOrThrow<string>('REDIS_URL'), {
      // Fail fast so a Redis outage never makes an API request wait.
      enableOfflineQueue: false, // while disconnected, reject instead of queueing
      commandTimeout: 500, // give up if a connected server stops answering
      maxRetriesPerRequest: 1,
    });
    this.client.on('error', (error) => this.logger.warn(error.message));
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value === null ? null : (JSON.parse(value) as T);
    } catch (error) {
      this.logger.warn(`Cache read failed: ${(error as Error).message}`);
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      this.logger.warn(`Cache write failed: ${(error as Error).message}`);
    }
  }

  async delete(...keys: string[]): Promise<void> {
    try {
      await this.client.del(...keys);
    } catch (error) {
      this.logger.warn(`Cache delete failed: ${(error as Error).message}`);
    }
  }

  /** For GET /health: true if Redis answers PING. */
  async ping(): Promise<boolean> {
    try {
      return (await this.client.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  onModuleDestroy(): void {
    this.client.disconnect();
  }
}
