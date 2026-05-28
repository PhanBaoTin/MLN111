import { IsIn, IsString } from 'class-validator';

export class AdminControlDto {
  @IsString()
  roomId: string;

  @IsIn(['start', 'pause', 'reset', 'end'])
  action: 'start' | 'pause' | 'reset' | 'end';

  /** Simple shared secret set when room was created. */
  @IsString()
  hostToken: string;
}
