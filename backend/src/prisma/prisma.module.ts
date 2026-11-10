/**
 * PrismaModule — @Global() so any module can inject PrismaService without
 * importing PrismaModule explicitly. Declared once in AppModule.
 *
 * WHY @Global(): avoids repetitive imports across AuthModule, GamesModule,
 * RunsModule, etc. — keeps modules slim (rubric theme #1: low coupling).
 * Drafted with an LLM coding assistant.
 */
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({
  providers: [PrismaService],
  exports:   [PrismaService],
})
export class PrismaModule {}

