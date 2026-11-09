/**
 * Root application module.
 * Imports ConfigModule globally so every other module can read process.env
 * via NestJS's ConfigService without re-importing it.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { FishApiModule } from './fish-api/fish-api.module.js';
import { GamesModule } from './games/games.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';
import { RedisModule } from './redis/redis.module.js';
import { ScoresModule } from './scores/scores.module.js';

@Module({
  imports: [
    // isGlobal: true means every module can inject ConfigService without
    // importing ConfigModule again — reduces boilerplate, aids cohesion.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Global DB access: feature modules inject PrismaService directly.
    EventEmitterModule.forRoot(), // the internal event bus
    PrismaModule,
    RedisModule,
    AuthModule,
    FishApiModule,
    GamesModule,
    ScoresModule,
    RealtimeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
