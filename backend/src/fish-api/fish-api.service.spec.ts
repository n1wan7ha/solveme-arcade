/**
 * Tests for the interoperability adapter with the HTTP client (axios, via
 * Nest's HttpService) mocked, so no real network calls are made.
 * Drafted with an LLM (Claude Code).
 */
import { BadGatewayException, Logger } from '@nestjs/common';
import type { HttpService } from '@nestjs/axios';
import type { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { FishApiService } from './fish-api.service.js';

const PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUg==';

const csvResponse = (body: string) => of({ data: body } as AxiosResponse<string>);
const networkError = () => throwError(() => new AxiosError('socket hang up', 'ECONNRESET'));
const notFound = () =>
  throwError(() => new AxiosError('Not Found', 'ERR_BAD_REQUEST', undefined, undefined, { status: 404 } as AxiosResponse));

describe('FishApiService', () => {
  let http: { get: ReturnType<typeof vi.fn> };
  let service: FishApiService;

  beforeAll(() => Logger.overrideLogger(false)); // keep test output clean

  beforeEach(() => {
    http = { get: vi.fn() };
    const config = { getOrThrow: () => 'https://fish.example' } as unknown as ConfigService;
    service = new FishApiService(http as unknown as HttpService, config);
  });

  it('retries a network error, then parses the CSV into { sol, image }', async () => {
    http.get.mockReturnValueOnce(networkError()).mockReturnValueOnce(csvResponse(`${PNG_BASE64},7,2\n`));

    await expect(service.getPuzzle('fish')).resolves.toEqual({ sol: 7, image: PNG_BASE64 });

    expect(http.get).toHaveBeenCalledTimes(2); // one failure, one retry
    const [url, options] = http.get.mock.calls[0];
    expect(url).toBe('https://fish.example/fish/api.php');
    expect(options.params).toMatchObject({ out: 'csv', base64: 'yes' });
  });

  it('does not retry a 4xx and reports a 502 Bad Gateway', async () => {
    http.get.mockReturnValue(notFound());

    await expect(service.getPuzzle('banana')).rejects.toBeInstanceOf(BadGatewayException);
    expect(http.get).toHaveBeenCalledTimes(1); // retrying a client error cannot help
  });
});
