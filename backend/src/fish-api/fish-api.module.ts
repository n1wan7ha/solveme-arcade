/**
 * Why this exists: packages the interoperability feature behind one boundary,
 * and sets the rules for every outgoing call to the Fish API.
 * Drafted with an LLM (Claude Code).
 */
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { FishApiController } from './fish-api.controller.js';
import { FishApiService } from './fish-api.service.js';

@Module({
  imports: [
    AuthModule,
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000, // per attempt
        maxRedirects: 0, // never follow the third party to another host
      }),
    }),
  ],
  controllers: [FishApiController],
  providers: [FishApiService],
})
export class FishApiModule {}
