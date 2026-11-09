/**
 * Why this exists: the two-way real-time channel. It authenticates sockets from
 * the login cookie, accepts finished games, and turns internal events into
 * messages for connected players.
 * Drafted with an LLM (Claude Code).
 */
import { OnModuleDestroy, UseFilters } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import type { Run } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { ACCESS_COOKIE } from '../auth/auth.constants.js';
import type {
  AccessTokenPayload,
  AuthUser,
} from '../auth/interfaces/auth-user.interface.js';
import { RunsService } from '../scores/runs.service.js';
import { LEADERBOARD_UPDATED, RUN_CREATED } from '../scores/scores.events.js';
import type {
  LeaderboardUpdatedEvent,
  RunCreatedEvent,
} from '../scores/scores.events.js';
import { SubmitRunDto } from './dto/submit-run.dto.js';
import { WsHttpExceptionFilter } from './ws-http-exception.filter.js';

const TICK_INTERVAL_MS = 5000;

@WebSocketGateway({
  cors: {
    // A function, so the environment is read after .env has been loaded.
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, allow: boolean) => void,
    ) => callback(null, origin === process.env.FRONTEND_URL),
    credentials: true,
  },
})
@UseFilters(new WsHttpExceptionFilter())
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnModuleDestroy
{
  @WebSocketServer()
  private readonly server: Server;

  private tickTimer: NodeJS.Timeout;

  constructor(
    private readonly jwt: JwtService,
    private readonly runsService: RunsService,
  ) {}

  afterInit(server: Server): void {
    // Middleware runs before a connection exists, so bad tokens never connect.
    server.use((socket, next) => {
      this.authenticate(socket)
        .then(() => next())
        .catch(() => next(new Error('Unauthorized')));
    });

    this.tickTimer = setInterval(() => {
      this.server.emit('game:tick', {
        serverTime: new Date().toISOString(),
        playersOnline: this.server.engine.clientsCount,
      });
    }, TICK_INTERVAL_MS);
  }

  /** Each user gets a private room, so a message can reach all their tabs. */
  handleConnection(client: Socket): void {
    const user = client.data.user as AuthUser;
    void client.join(this.userRoom(user.id));
  }

  // The global ValidationPipe from main.ts checks the body against SubmitRunDto.
  @SubscribeMessage('game:submit')
  async submitRun(
    @ConnectedSocket() client: Socket,
    @MessageBody() { gameId, ...run }: SubmitRunDto,
  ): Promise<Run> {
    // A socket outlives the token that opened it, so check expiry on each use.
    if (Date.now() >= client.data.tokenExpiresAt) {
      throw new WsException('Session expired, please reconnect');
    }

    const user = client.data.user as AuthUser;
    // The return value is sent back as the Socket.IO acknowledgement.
    return this.runsService.createRun(user.id, gameId, run);
  }

  @OnEvent(RUN_CREATED)
  handleRunCreated({ run, username }: RunCreatedEvent): void {
    this.server.to(this.userRoom(run.userId)).emit('run:saved', run);
    this.server.emit('score:updated', {
      username,
      gameId: run.gameId,
      score: run.score,
    });
  }

  @OnEvent(LEADERBOARD_UPDATED)
  handleLeaderboardUpdated(event: LeaderboardUpdatedEvent): void {
    this.server.emit('leaderboard:changed', event);
  }

  onModuleDestroy(): void {
    clearInterval(this.tickTimer);
  }

  private async authenticate(socket: Socket): Promise<void> {
    const token = this.readAccessToken(socket.handshake.headers.cookie);
    const payload = await this.jwt.verifyAsync<
      AccessTokenPayload & { exp: number }
    >(token);

    const user: AuthUser = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
    socket.data.user = user;
    socket.data.tokenExpiresAt = payload.exp * 1000;
  }

  private readAccessToken(cookieHeader = ''): string {
    const prefix = `${ACCESS_COOKIE}=`;
    const cookie = cookieHeader
      .split('; ')
      .find((part) => part.startsWith(prefix));
    return cookie?.slice(prefix.length) ?? '';
  }

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }
}
