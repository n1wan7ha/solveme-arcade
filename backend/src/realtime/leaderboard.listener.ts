/**
 * Why this exists: reacts to a saved run by recalculating the affected
 * leaderboards and announcing them. Neither side calls the other directly.
 * Drafted with an LLM (Claude Code).
 */
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { RunsService } from '../scores/runs.service.js';
import {
  ALL_GAMES,
  LEADERBOARD_UPDATED,
  RUN_CREATED,
} from '../scores/scores.events.js';
import type {
  LeaderboardUpdatedEvent,
  RunCreatedEvent,
} from '../scores/scores.events.js';

@Injectable()
export class LeaderboardListener {
  constructor(
    private readonly runsService: RunsService,
    private readonly events: EventEmitter2,
  ) {}

  @OnEvent(RUN_CREATED)
  async handleRunCreated({ run }: RunCreatedEvent): Promise<void> {
    // One new score changes that game's board and the all-games board.
    for (const gameId of [run.gameId, ALL_GAMES]) {
      const leaderboard = await this.runsService.leaderboard(gameId);
      const event: LeaderboardUpdatedEvent = { gameId, leaderboard };
      this.events.emit(LEADERBOARD_UPDATED, event);
    }
  }
}
