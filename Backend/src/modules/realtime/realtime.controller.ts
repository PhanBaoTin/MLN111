import { Controller, Get, Param, Query } from '@nestjs/common';
import { RealtimeService } from './realtime.service';

@Controller('rooms')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Get(':roomKey/state')
  getRoomState(@Param('roomKey') roomKey: string) {
    return this.realtimeService.getRoomState(roomKey);
  }

  @Get(':roomKey/leaderboard')
  getLeaderboard(@Param('roomKey') roomKey: string) {
    return this.realtimeService.getLeaderboardByKey(roomKey);
  }

  @Get(':roomKey/players')
  getPlayers(
    @Param('roomKey') roomKey: string,
    @Query('team') team?: 'red' | 'blue' | 'unassigned',
    @Query('connected') connected?: string,
  ) {
    const connectedValue =
      connected === 'true' ? true : connected === 'false' ? false : undefined;

    return this.realtimeService.getPlayersByKey(roomKey, {
      team,
      connected: connectedValue,
    });
  }
}
