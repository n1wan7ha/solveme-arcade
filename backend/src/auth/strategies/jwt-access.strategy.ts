/**
 * Why this exists: tells Passport how to verify the access JWT, read from the
 * HttpOnly cookie that browser JavaScript cannot touch.
 * Drafted with an LLM (Claude Code).
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { ACCESS_COOKIE } from '../auth.constants.js';
import type {
  AccessTokenPayload,
  AuthUser,
} from '../interfaces/auth-user.interface.js';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => req.cookies?.[ACCESS_COOKIE] ?? null,
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  /** Runs after the signature and expiry pass; the result becomes req.user. */
  validate(payload: AccessTokenPayload): AuthUser {
    return { id: payload.sub, username: payload.username, role: payload.role };
  }
}
