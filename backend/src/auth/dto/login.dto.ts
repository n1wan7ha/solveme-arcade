/**
 * Why this exists: checks the login body has the right shape. Password strength
 * rules belong to registration only, so the demo users can still sign in.
 * Drafted with an LLM (Claude Code).
 */
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password: string;
}
