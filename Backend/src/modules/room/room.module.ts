import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from '../quiz/quiz.schema';
import { RoomController } from './room.controller';
import { Room, RoomSchema } from './room.schema';
import { RoomService } from './room.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Quiz.name, schema: QuizSchema },
    ]),
  ],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [MongooseModule, RoomService],
})
export class RoomModule {}
