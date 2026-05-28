import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';

@Schema({ collection: 'players', timestamps: { createdAt: 'joinedAt', updatedAt: false } })
export class Player {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Room', required: true, index: true })
  roomId: Types.ObjectId;

  @Prop({ type: String })
  socketId?: string | null;

  @Prop({ required: true })
  nickname: string;

  @Prop({ enum: ['red', 'blue'] })
  team?: 'red' | 'blue';

  @Prop({ default: 0 })
  score: number;

  @Prop({ default: 0 })
  streak: number;

  @Prop({ default: 0 })
  resetCount: number;

  @Prop({ default: true })
  connected: boolean;

  /** Auto-set by Mongoose timestamps option */
  joinedAt?: Date;
}

export type PlayerDocument = HydratedDocument<Player>;
export const PlayerSchema = SchemaFactory.createForClass(Player);
