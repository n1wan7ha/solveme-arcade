/**
 * Why this exists: the guard other modules use to require a signed-in user,
 * without needing to know that Passport or cookies are involved.
 * Drafted with an LLM (Claude Code).
 */
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-access') {}
