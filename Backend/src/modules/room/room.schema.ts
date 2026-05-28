import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';

export type RoomStatus = 'waiting' | 'playing' | 'finished';

@Schema({ _id: false })
export class RoomSettings {
  @Prop({ default: false })
  shuffleQuestions: boolean;

  @Prop({ default: false })
  shuffleOptions: boolean;

  @Prop()
  maxPlayers?: number;
}

@Schema({ collection: 'rooms', timestamps: { createdAt: true, updatedAt: false } })
export class Room {
  @Prop({ required: true, unique: true, index: true })
  pin: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Quiz', required: true })
  quizId: Types.ObjectId;

  @Prop({ required: true })
  hostPlayerId: string;

  @Prop({ required: true, default: 'waiting' })
  status: RoomStatus;

  @Prop({ default: 0 })
  currentQuestionIndex: number;

  @Prop()
  startedAt?: Date;

  @Prop()
  endedAt?: Date;

  @Prop({ type: RoomSettings, default: () => ({}) })
  settings: RoomSettings;
}

export type RoomDocument = HydratedDocument<Room>;
export const RoomSchema = SchemaFactory.createForClass(Room);
