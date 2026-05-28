import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  roomId: string;

  @IsString()
  nickname: string;

  @IsOptional()
  @IsIn(['red', 'blue'])
  team?: 'red' | 'blue';
}
