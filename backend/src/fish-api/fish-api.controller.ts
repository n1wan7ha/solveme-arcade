/**
 * Why this exists: the browser asks our backend for puzzles and never contacts
 * the third party directly.
 * Drafted with an LLM (Claude Code).
 */
import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PuzzleQueryDto } from './dto/puzzle-query.dto.js';
import { FishApiService } from './fish-api.service.js';
import type { FishPuzzle } from './interfaces/fish-puzzle.interface.js';

@Controller('fish')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class FishApiController {
  constructor(private readonly fishApi: FishApiService) {}

  @Get('puzzle')
  getPuzzle(@Query() query: PuzzleQueryDto): Promise<FishPuzzle> {
    return this.fishApi.getPuzzle(query.category);
  }
}
