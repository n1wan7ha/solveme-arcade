/**
 * Root application module.
 * Imports ConfigModule globally so every other module can read process.env
 * via NestJS's ConfigService without re-importing it.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    // isGlobal: true means every module can inject ConfigService without
    // importing ConfigModule again — reduces boilerplate, aids cohesion.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Global DB access: feature modules inject PrismaService directly.
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
