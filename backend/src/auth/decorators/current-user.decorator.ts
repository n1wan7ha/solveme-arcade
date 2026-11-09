/**
 * Why this exists: lets a controller write @CurrentUser() instead of reaching
 * into the raw request for the user Passport attached.
 * Drafted with an LLM (Claude Code).
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    context.switchToHttp().getRequest().user,
);
