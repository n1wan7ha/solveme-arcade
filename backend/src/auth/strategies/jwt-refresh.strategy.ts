/**
 * Why this exists: verifies the refresh JWT, signed with its own secret, and
 * passes the raw token on so AuthService can match it against the database.
 * Drafted with an LLM (Claude Code).
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { REFRESH_COOKIE } from '../auth.constants.js';
import type {
  RefreshPrincipal,
  RefreshTokenPayload,
} from '../interfaces/auth-user.interface.js';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => req.cookies?.[REFRESH_COOKIE] ?? null,
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: RefreshTokenPayload): RefreshPrincipal {
    return { id: payload.sub, refreshToken: req.cookies[REFRESH_COOKIE] };
  }
}
