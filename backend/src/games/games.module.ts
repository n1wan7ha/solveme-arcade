/**
 * Why this exists: packages the game catalogue as its own feature.
 * Drafted with an LLM (Claude Code).
 */
import { Module } from '@nestjs/common';
import { GamesController } from './games.controller.js';
import { GamesService } from './games.service.js';

@Module({
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
