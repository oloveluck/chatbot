import { IsString, Length } from 'class-validator';
export class PromptDto {
  @IsString()
  @Length(5, 50)
  prompt: string;
}
