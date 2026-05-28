import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';

@Schema({
  collection: 'player_answers',
  timestamps: { createdAt: 'answeredAt', updatedAt: false },
})
export class PlayerAnswer {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Room', required: true, index: true })
  roomId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Player', required: true, index: true })
  playerId: Types.ObjectId;

  @Prop({ required: true, index: true })
  questionId: string;

  @Prop({ required: true })
  selectedOptionId: string;

  @Prop({ required: true })
  isCorrect: boolean;

  @Prop({ required: true })
  responseTime: number;

  @Prop({ required: true })
  earnedScore: number;
}

export type PlayerAnswerDocument = HydratedDocument<PlayerAnswer>;
export const PlayerAnswerSchema = SchemaFactory.createForClass(PlayerAnswer);
