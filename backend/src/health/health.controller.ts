/**
 * Why this exists: GET /health for Docker, monitoring and the demo. Returns
 * 200 while the app can serve players, 503 when the database is down.
 * Drafted with an LLM (Claude Code).
 */
import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { HealthService } from './health.service.js';
import type { HealthReport } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check(@Res({ passthrough: true }) res: Response): Promise<HealthReport> {
    const report = await this.healthService.check();
    if (report.status === 'down') res.status(HttpStatus.SERVICE_UNAVAILABLE);
    return report;
  }
}
