/**
 * Why this exists: the HTTP face of authentication. It maps routes to
 * AuthService and is the only place that reads or writes auth cookies.
 * Drafted with an LLM (Claude Code).
 */
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { CookieOptions, Request, Response } from 'express';
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_COOKIE_PATH,
} from './auth.constants.js';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import type {
  AuthSession,
  AuthUser,
  RefreshPrincipal,
} from './interfaces/auth-user.interface.js';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUser> {
    const session = await this.authService.register(dto);
    this.setAuthCookies(res, session);
    return session.user;
  }

  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: AuthUser }> {
    const session = await this.authService.login(dto);
    this.setAuthCookies(res, session);
    return { user: session.user };
  }

  @Post('refresh')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(
    @CurrentUser() principal: RefreshPrincipal,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: AuthUser }> {
    const session = await this.authService.refresh(
      principal.id,
      principal.refreshToken,
    );
    this.setAuthCookies(res, session);
    return { user: session.user };
  }

  // Deliberately unguarded: a user with an expired token must still be able
  // to sign out.
  @Post('logout')
  @HttpCode(204)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(req.cookies?.[REFRESH_COOKIE]);
    res.clearCookie(ACCESS_COOKIE, this.cookieOptions('/'));
    res.clearCookie(REFRESH_COOKIE, this.cookieOptions(REFRESH_COOKIE_PATH));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser): Promise<AuthUser> {
    return this.authService.getUser(user.id);
  }

  private setAuthCookies(res: Response, session: AuthSession): void {
    res.cookie(ACCESS_COOKIE, session.accessToken, {
      ...this.cookieOptions('/'),
      expires: session.accessExpiresAt,
    });
    res.cookie(REFRESH_COOKIE, session.refreshToken, {
      ...this.cookieOptions(REFRESH_COOKIE_PATH),
      expires: session.refreshExpiresAt,
    });
  }

  private cookieOptions(path: string): CookieOptions {
    return {
      httpOnly: true, // JavaScript cannot read it, which blunts XSS token theft
      sameSite: 'strict', // not sent on cross-site requests, which blocks CSRF
      secure: this.config.get('NODE_ENV') === 'production', // HTTPS only in prod
      path,
    };
  }
}
