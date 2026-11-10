/**
 * Happy-path test for runs and leaderboards: saving a run clears the cached
 * leaderboards and announces run.created on the event bus; the leaderboard is
 * ranked and cached. Database and Redis are replaced by fakes.
 * Drafted with an LLM (Claude Code).
 */
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { RedisService } from '../redis/redis.service.js';
import { RunsService } from './runs.service.js';
import { RUN_CREATED } from './scores.events.js';

const NEW_RUN = { score: 120, attempts: 5, correct: 4, maxCombo: 3, startedAt: '2026-11-11T10:00:00.000Z' };

describe('RunsService', () => {
  let prisma: {
    run: { create: ReturnType<typeof vi.fn>; groupBy: ReturnType<typeof vi.fn> };
    user: { findMany: ReturnType<typeof vi.fn> };
  };
  let cache: { getJson: ReturnType<typeof vi.fn>; setJson: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let events: EventEmitter2;
  let service: RunsService;

  beforeEach(() => {
    prisma = {
      run: {
        create: vi.fn(async ({ data }) => ({ id: 'run-1', finishedAt: new Date(), ...data, user: { username: 'tester' } })),
        groupBy: vi.fn(),
      },
      user: { findMany: vi.fn() },
    };
    cache = { getJson: vi.fn().mockResolvedValue(null), setJson: vi.fn(), delete: vi.fn() };
    events = new EventEmitter2();
    service = new RunsService(prisma as unknown as PrismaService, cache as unknown as RedisService, events);
  });

  it('saves a run, clears cached leaderboards and emits run.created', async () => {
    const listener = vi.fn();
    events.on(RUN_CREATED, listener);

    const run = await service.createRun('user-1', 'snake', NEW_RUN);

    expect(run).toMatchObject({ id: 'run-1', userId: 'user-1', gameId: 'snake', score: 120 });
    expect(run).not.toHaveProperty('user'); // the join is not leaked in the response
    expect(cache.delete).toHaveBeenCalledWith('leaderboard:snake', 'leaderboard:all');
    expect(listener).toHaveBeenCalledWith({ run, username: 'tester' });
  });

  it('ranks best scores per player and caches the result for 30 seconds', async () => {
    prisma.run.groupBy.mockResolvedValue([
      { userId: 'u2', _max: { score: 900 } },
      { userId: 'u1', _max: { score: 450 } },
    ]);
    prisma.user.findMany.mockResolvedValue([
      { id: 'u1', username: 'player' },
      { id: 'u2', username: 'niwantha' },
    ]);

    const board = await service.leaderboard('snake');

    expect(board).toEqual([
      { rank: 1, username: 'niwantha', score: 900 },
      { rank: 2, username: 'player', score: 450 },
    ]);
    expect(cache.setJson).toHaveBeenCalledWith('leaderboard:snake', board, 30);
  });
});
