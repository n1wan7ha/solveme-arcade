/**
 * Why this exists: the HTTP route for reading the leaderboard.
 * Drafted with an LLM (Claude Code).
 */
import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto.js';
import type { LeaderboardEntry } from './interfaces/leaderboard-entry.interface.js';
import { RunsService } from './runs.service.js';

@Controller('leaderboard')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class LeaderboardController {
  constructor(private readonly runsService: RunsService) {}

  @Get()
  getLeaderboard(
    @Query() query: LeaderboardQueryDto,
  ): Promise<LeaderboardEntry[]> {
    return this.runsService.leaderboard(query.gameId);
  }
}
