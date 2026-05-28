import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerAnswer, PlayerAnswerSchema } from './player-answer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlayerAnswer.name, schema: PlayerAnswerSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class PlayerAnswerModule {}
