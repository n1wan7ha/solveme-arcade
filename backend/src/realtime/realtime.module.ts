/**
 * Why this exists: groups the event-driven delivery layer. It depends on the
 * scores feature, while scores has no knowledge of sockets or SSE.
 * Drafted with an LLM (Claude Code).
 */
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ScoresModule } from '../scores/scores.module.js';
import { GameGateway } from './game.gateway.js';
import { LeaderboardSseController } from './leaderboard-sse.controller.js';
import { LeaderboardListener } from './leaderboard.listener.js';

@Module({
  imports: [AuthModule, ScoresModule],
  controllers: [LeaderboardSseController],
  providers: [GameGateway, LeaderboardListener],
})
export class RealtimeModule {}
