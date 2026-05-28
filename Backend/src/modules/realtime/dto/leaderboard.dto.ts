import { IsString } from 'class-validator';

export class LeaderboardDto {
  @IsString()
  roomId: string;
}
