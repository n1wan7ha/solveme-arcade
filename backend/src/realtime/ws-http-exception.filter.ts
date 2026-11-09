/**
 * Why this exists: services and the global validation pipe throw HTTP errors,
 * which WebSockets cannot represent. This converts them so a socket client
 * gets the real message rather than "Internal server error".
 * Drafted with an LLM (Claude Code).
 */
import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

@Catch()
export class WsHttpExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof HttpException) {
      const { message } = exception.getResponse() as {
        message: string | string[];
      };
      // Validation errors arrive as a list of messages.
      super.catch(new WsException([message].flat().join(', ')), host);
      return;
    }
    super.catch(exception, host);
  }
}
