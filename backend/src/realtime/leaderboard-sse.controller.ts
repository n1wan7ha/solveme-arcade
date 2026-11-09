/**
 * Why this exists: a one-way live feed of leaderboard changes using Server-Sent
 * Events. It needs no custom protocol, and curl can watch it.
 * Drafted with an LLM (Claude Code).
 */
import { Controller, Sse } from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { fromEvent, map, Observable } from 'rxjs';
import { LEADERBOARD_UPDATED } from '../scores/scores.events.js';
import type { LeaderboardUpdatedEvent } from '../scores/scores.events.js';

@Controller('sse')
export class LeaderboardSseController {
  constructor(private readonly events: EventEmitter2) {}

  // NestJS unsubscribes automatically when the client disconnects.
  @Sse('leaderboard')
  streamLeaderboard(): Observable<MessageEvent> {
    return fromEvent(this.events, LEADERBOARD_UPDATED).pipe(
      map((event) => ({ data: event as LeaderboardUpdatedEvent })),
    );
  }
}
