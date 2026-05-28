import { IsOptional, IsString } from 'class-validator';

/** Sent on reconnect to get a full state snapshot for a room. */
export class GetSnapshotDto {
  @IsString()
  roomId: string;

  /** Player's own id so we can re-attach socket mapping. */
  @IsOptional()
  @IsString()
  playerId?: string;
}
