import { IsInt, IsString, Min } from 'class-validator';

export class AnswerQuestionDto {
  @IsString()
  roomId: string;

  @IsString()
  playerId: string;

  @IsString()
  questionId: string;

  @IsString()
  selectedOptionId: string;

  @IsInt()
  @Min(0)
  responseTime: number;
}
