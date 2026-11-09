/**
 * Why this exists: role-based access control. Authentication says who you are;
 * this guard decides what you may do. Use it after JwtAuthGuard.
 * Drafted with an LLM (Claude Code).
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // A route with no @Roles() is open to any signed-in user.
    if (!allowedRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return allowedRoles.includes(user?.role);
  }
}
