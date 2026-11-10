/**
 * Why this exists: packages the health check as its own small feature.
 * Drafted with an LLM (Claude Code).
 */
import { Module } from '@nestjs/common';
import { FishApiModule } from '../fish-api/fish-api.module.js';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

@Module({
  imports: [FishApiModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
