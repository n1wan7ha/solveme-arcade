/**
 * Why this exists: HTTP routes for saving a run and reading your own history.
 * The user always comes from the verified token, never from the request body.
 * Drafted with an LLM (Claude Code).
 */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Run } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthUser } from '../auth/interfaces/auth-user.interface.js';
import { CreateRunDto } from './dto/create-run.dto.js';
import { RunsService } from './runs.service.js';

@Controller()
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Post('games/:gameId/runs')
  createRun(
    @CurrentUser() user: AuthUser,
    @Param('gameId') gameId: string,
    @Body() dto: CreateRunDto,
  ): Promise<Run> {
    return this.runsService.createRun(user.id, gameId, dto);
  }

  @Get('me/runs')
  listMyRuns(@CurrentUser() user: AuthUser): Promise<Run[]> {
    return this.runsService.listUserRuns(user.id);
  }
}
