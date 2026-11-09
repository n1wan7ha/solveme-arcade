/**
 * Why this exists: a WebSocket message has no URL, so game:submit carries the
 * gameId in its body. All other rules are reused from CreateRunDto.
 * Drafted with an LLM (Claude Code).
 */
import { Matches } from 'class-validator';
import { CreateRunDto } from '../../scores/dto/create-run.dto.js';

export class SubmitRunDto extends CreateRunDto {
  @Matches(/^[a-z0-9-]{1,40}$/, { message: 'gameId must be a game slug' })
  gameId: string;
}
