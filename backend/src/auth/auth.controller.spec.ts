/**
 * Happy-path test for the virtual-identity module, over real HTTP with
 * Supertest: register → cookies → /auth/me → refresh rotation → logout.
 * The real AuthModule runs; only the database is replaced by an in-memory fake.
 * Drafted with an LLM (Claude Code).
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthModule } from './auth.module.js';

const TEST_CONFIG = {
  JWT_ACCESS_SECRET: 'test-access-secret',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
  JWT_ACCESS_TTL: '15m',
  JWT_REFRESH_TTL: '7d',
  BCRYPT_ROUNDS: '4', // fast hashing for tests
  NODE_ENV: 'test',
};

interface FakeUser { id: string; username: string; passwordHash: string; role: 'PLAYER' }
interface FakeToken { userId: string; tokenHash: string; expiresAt: Date; revokedAt: Date | null }

/** Just enough of PrismaService for AuthService. */
function fakePrisma() {
  const users: FakeUser[] = [];
  const tokens: FakeToken[] = [];
  const findUser = ({ where }: { where: { id?: string; username?: string } }) =>
    users.find((u) => u.id === where.id || u.username === where.username) ?? null;

  return {
    user: {
      create: async ({ data }: { data: Omit<FakeUser, 'id' | 'role'> }) => {
        const user: FakeUser = { id: `user-${users.length + 1}`, role: 'PLAYER', ...data };
        users.push(user);
        return user;
      },
      findUnique: async (args: { where: { id?: string; username?: string } }) => findUser(args),
      findUniqueOrThrow: async (args: { where: { id?: string } }) => findUser(args)!,
    },
    refreshToken: {
      create: async ({ data }: { data: Omit<FakeToken, 'revokedAt'> }) => tokens.push({ ...data, revokedAt: null }),
      updateMany: async ({ where, data }: { where: { tokenHash: string }; data: { revokedAt: Date } }) => {
        const active = tokens.filter((t) => t.tokenHash === where.tokenHash && t.revokedAt === null);
        active.forEach((t) => (t.revokedAt = data.revokedAt));
        return { count: active.length };
      },
    },
  };
}

/** "access_token=abc; Path=/; HttpOnly" → "access_token=abc" */
const cookiePairs = (res: request.Response) =>
  ([] as string[]).concat(res.headers['set-cookie'] ?? []).map((c) => c.split(';')[0]);

describe('AuthModule (happy path)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [() => TEST_CONFIG] }),
        PrismaModule,
        AuthModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(fakePrisma())
      .compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers, proves identity with cookies, rotates the refresh token and logs out', async () => {
    const server = app.getHttpServer();

    // Register: 201, user DTO, two HttpOnly cookies
    const registered = await request(server)
      .post('/auth/register')
      .send({ username: 'tester', password: 'longenough1' })
      .expect(201);
    expect(registered.body).toEqual({ id: 'user-1', username: 'tester', role: 'PLAYER' });
    expect(registered.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^access_token=.+HttpOnly; SameSite=Strict/),
        expect.stringMatching(/^refresh_token=.+Path=\/auth; .*HttpOnly; SameSite=Strict/),
      ]),
    );
    const cookies = cookiePairs(registered);

    // The cookie is the identity; without it the request is rejected
    await request(server).get('/auth/me').expect(401);
    const me = await request(server).get('/auth/me').set('Cookie', cookies).expect(200);
    expect(me.body.username).toBe('tester');

    // Refresh rotates: the new token works, the old one is now revoked
    const refreshed = await request(server).post('/auth/refresh').set('Cookie', cookies).expect(200);
    const newCookies = cookiePairs(refreshed);
    expect(newCookies).not.toEqual(cookies);
    await request(server).post('/auth/refresh').set('Cookie', cookies).expect(401);

    // Logout revokes the current refresh token and clears the cookies
    await request(server).post('/auth/logout').set('Cookie', newCookies).expect(204);
    await request(server).post('/auth/refresh').set('Cookie', newCookies).expect(401);
  });
});
