import { IsIn, IsOptional, IsString } from 'class-validator';

export class JoinRoomDto {
  @IsOptional()
  @IsString()
  pin?: string;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsString()
  nickname: string;

  @IsOptional()
  @IsIn(['red', 'blue'])
  team?: 'red' | 'blue';
}
