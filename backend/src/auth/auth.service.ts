/**
 * Why this exists: all identity rules live here: password hashing, issuing
 * tokens, and rotating or revoking refresh tokens. It knows nothing about HTTP
 * or cookies; the controller handles those.
 * Drafted with an LLM (Claude Code).
 */
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { LoginDto } from './dto/login.dto.js';
import type { RegisterDto } from './dto/register.dto.js';
import type {
  AccessTokenPayload,
  AuthSession,
  AuthUser,
  RefreshTokenPayload,
} from './interfaces/auth-user.interface.js';

// Prisma's error code for a unique-constraint violation.
const UNIQUE_VIOLATION = 'P2002';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthSession> {
    const rounds = Number(this.config.getOrThrow<string>('BCRYPT_ROUNDS'));
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    try {
      const user = await this.prisma.user.create({
        data: { username: dto.username, passwordHash },
      });
      return await this.startSession(this.toAuthUser(user));
    } catch (error) {
      // Letting the database reject duplicates avoids a check-then-insert race.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_VIOLATION
      ) {
        throw new ConflictException('Username is already taken');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthSession> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    // One message for both failures, so it never reveals which part was wrong.
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid username or password');
    }

    return this.startSession(this.toAuthUser(user));
  }

  /** Rotation: a refresh token works once and is replaced by a new one. */
  async refresh(userId: string, rawRefreshToken: string): Promise<AuthSession> {
    const now = new Date();

    // The WHERE clause makes this atomic: if a token is replayed, or two
    // requests race, only one can flip it from "active" to "revoked".
    const revoked = await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash: this.hashToken(rawRefreshToken),
        userId,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { revokedAt: now },
    });

    if (revoked.count !== 1) {
      throw new UnauthorizedException('Refresh token is no longer valid');
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    return this.startSession(this.toAuthUser(user));
  }

  /** Safe to call repeatedly: an unknown or already revoked token is a no-op. */
  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) return;

    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hashToken(rawRefreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async getUser(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.toAuthUser(user);
  }

  private async startSession(user: AuthUser): Promise<AuthSession> {
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      jti: randomUUID(),
    };

    const accessToken = await this.jwt.signAsync(accessPayload);
    const refreshToken = await this.jwt.signAsync(refreshPayload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.getOrThrow('JWT_REFRESH_TTL'),
    });
    const refreshExpiresAt = this.expiryOf(refreshToken);

    // Only a hash is stored, so a database leak does not leak usable tokens.
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      user,
      accessToken,
      accessExpiresAt: this.expiryOf(accessToken),
      refreshToken,
      refreshExpiresAt,
    };
  }

  /** SHA-256 always gives the same output, so the hash can be looked up. */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /** Reads the "exp" claim (seconds since 1970) of a token we just signed. */
  private expiryOf(token: string): Date {
    const { exp } = this.jwt.decode<{ exp: number }>(token);
    return new Date(exp * 1000);
  }

  private toAuthUser(user: AuthUser): AuthUser {
    return { id: user.id, username: user.username, role: user.role };
  }
}
