/**
 * Why this exists: packages runs and leaderboards as one feature, and exports
 * RunsService so the real-time gateway can reuse the same rules.
 * Drafted with an LLM (Claude Code).
 */
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { LeaderboardController } from './leaderboard.controller.js';
import { RunsController } from './runs.controller.js';
import { RunsService } from './runs.service.js';

@Module({
  imports: [AuthModule],
  controllers: [RunsController, LeaderboardController],
  providers: [RunsService],
  exports: [RunsService],
})
export class ScoresModule {}
