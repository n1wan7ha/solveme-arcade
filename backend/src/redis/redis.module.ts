/**
 * Why this exists: one shared Redis connection for the whole app. Global, like
 * PrismaModule, because it is infrastructure rather than a feature.
 * Drafted with an LLM (Claude Code).
 */
import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service.js';

@Global()
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
