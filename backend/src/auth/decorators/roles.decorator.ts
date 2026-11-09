/**
 * Why this exists: marks a route with the roles allowed to call it, e.g.
 * @Roles(Role.ADMIN). RolesGuard reads this metadata and enforces it.
 * Drafted with an LLM (Claude Code).
 */
import { SetMetadata } from '@nestjs/common';
import type { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
