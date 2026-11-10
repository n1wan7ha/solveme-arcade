/**
 * Application entry point.
 * Configures global middleware, pipes, CORS, and cookie parsing
 * before the HTTP server starts listening.
 * Drafted with an LLM coding assistant.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parse HttpOnly cookies (used for JWT access + refresh tokens)
  app.use(cookieParser());

  // Strip unknown fields (whitelist) and auto-transform payloads to DTO classes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,   // strip properties not in the DTO
      transform: true,   // auto-transform plain objects to class instances
      forbidNonWhitelisted: false,
    }),
  );

  // Allow the React frontend to send credentials (cookies) cross-origin
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}
await bootstrap();
