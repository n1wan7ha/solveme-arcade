/**
 * Why this exists: the HTTP route for the game catalogue.
 * Drafted with an LLM (Claude Code).
 */
import { Controller, Get } from '@nestjs/common';
import type { Game } from '@prisma/client';
import { GamesService } from './games.service.js';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get()
  listGames(): Promise<Game[]> {
    return this.gamesService.listGames();
  }
}
