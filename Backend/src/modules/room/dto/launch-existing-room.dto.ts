import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class LaunchExistingRoomDto {
  @IsString()
  quizId: string;

  @IsString()
  pin: string;

  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @IsOptional()
  @IsBoolean()
  shuffleOptions?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxPlayers?: number;
}
