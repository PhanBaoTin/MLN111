import { Module } from '@nestjs/common';
import { PlayerAnswerModule } from '../player-answer/player-answer.module';
import { PlayerModule } from '../player/player.module';
import { QuizModule } from '../quiz/quiz.module';
import { RoomModule } from '../room/room.module';
import { RealtimeController } from './realtime.controller';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { RoomStateService } from './room-state.service';

@Module({
  imports: [RoomModule, QuizModule, PlayerModule, PlayerAnswerModule],
  controllers: [RealtimeController],
  providers: [RealtimeGateway, RealtimeService, RoomStateService],
})
export class RealtimeModule {}
