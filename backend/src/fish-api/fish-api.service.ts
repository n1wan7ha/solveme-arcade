/**
 * Why this exists: the adapter between our app and the external Fish API. Its
 * URL, CSV format, retries and failures are all contained in this one file.
 * Drafted with an LLM (Claude Code).
 */
import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { randomUUID } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import { firstValueFrom } from 'rxjs';
import type { FishCategory } from './dto/puzzle-query.dto.js';
import type { FishPuzzle } from './interfaces/fish-puzzle.interface.js';

// Wait before each retry: one first try plus these three retries.
const RETRY_DELAYS_MS = [300, 900, 2700];

@Injectable()
export class FishApiService {
  private readonly logger = new Logger(FishApiService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getPuzzle(category: FishCategory): Promise<FishPuzzle> {
    // The same ID appears on every attempt, so one request can be traced.
    const correlationId = randomUUID();
    const maxAttempts = RETRY_DELAYS_MS.length + 1;

    for (let attempt = 1; ; attempt++) {
      const startedAt = Date.now();
      const logEntry = { correlationId, category, attempt };

      try {
        const puzzle = this.parseCsv(await this.fetchCsv(category));
        const ms = Date.now() - startedAt;
        this.logger.log(JSON.stringify({ ...logEntry, ms, success: true }));
        return puzzle;
      } catch (error) {
        const ms = Date.now() - startedAt;
        this.logger.warn(
          JSON.stringify({
            ...logEntry,
            ms,
            success: false,
            error: (error as Error).message,
          }),
        );

        if (attempt === maxAttempts || !this.isRetryable(error)) {
          throw new BadGatewayException('Fish API is unavailable');
        }
        await sleep(RETRY_DELAYS_MS[attempt - 1]);
      }
    }
  }

  /** For GET /health: one attempt, no retries, so the check stays quick. */
  async ping(): Promise<boolean> {
    try {
      this.parseCsv(await this.fetchCsv('fish'));
      return true;
    } catch {
      return false;
    }
  }

  private async fetchCsv(category: FishCategory): Promise<string> {
    const baseUrl = this.config.getOrThrow<string>('FISH_API_URL');
    const response = await firstValueFrom(
      this.http.get<string>(`${baseUrl}/${category}/api.php`, {
        responseType: 'text',
        params: { out: 'csv', base64: 'yes', nocache: Date.now() },
      }),
    );
    return response.data;
  }

  /**
   * Format: "<base64Png>,<solution>". The fish category adds a third value,
   * the chest count, which the arcade does not use.
   */
  private parseCsv(csv: string): FishPuzzle {
    const [image, solution] = csv.trim().split(',');
    const sol = Number.parseInt(solution, 10);

    if (!image || Number.isNaN(sol)) {
      throw new Error('Unexpected Fish API response format');
    }
    return { sol, image };
  }

  /** Only temporary faults are retried: no response at all, or a 5xx. */
  private isRetryable(error: unknown): boolean {
    if (!isAxiosError(error)) return false;
    return !error.response || error.response.status >= 500;
  }
}
