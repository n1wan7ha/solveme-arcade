/**
 * PrismaService — wraps PrismaClient so NestJS can manage its lifecycle.
 * Extends PrismaClient directly so all Prisma methods (prisma.user.findMany…)
 * are available on the injected service with no extra indirection.
 *
 * WHY: Rubric theme #1 — single-responsibility module that owns the DB
 * connection. Every other module imports PrismaModule and injects PrismaService
 * instead of creating its own PrismaClient instance.
 * Drafted with an LLM coding assistant.
 */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}

