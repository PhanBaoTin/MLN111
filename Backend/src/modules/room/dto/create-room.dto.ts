import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  pin: string;

  @IsString()
  quizId: string;

  @IsString()
  hostPlayerId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentQuestionIndex?: number;

  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @IsOptional()
  @IsBoolean()
  shuffleOptions?: boolean;

  @IsOptional()
  @IsInt()
  @Min(2)
  maxTeams?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  globalTimeLimit?: number;
}
