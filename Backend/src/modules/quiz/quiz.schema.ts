import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class QuizOption {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  isCorrect: boolean;
}

export const QuizOptionSchema = SchemaFactory.createForClass(QuizOption);

@Schema({ _id: false })
export class QuizQuestion {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true, default: 'single_choice' })
  type: 'single_choice';

  @Prop({ required: true })
  timeLimit: number;

  @Prop({ required: true })
  points: number;

  @Prop({ required: true })
  order: number;

  @Prop({ type: [QuizOptionSchema], default: [] })
  options: QuizOption[];
}

export const QuizQuestionSchema = SchemaFactory.createForClass(QuizQuestion);

@Schema({ collection: 'quizzes', timestamps: true })
export class Quiz {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, default: 'private' })
  visibility: 'public' | 'private';

  /**
   * Base64-encoded reveal image (data URL).
   * Stored as a string; will be large – consider moving to GridFS for production.
   */
  @Prop({ type: String })
  imageBase64?: string;

  @Prop({ type: [QuizQuestionSchema], default: [] })
  questions: QuizQuestion[];
}

export type QuizDocument = HydratedDocument<Quiz>;
export const QuizSchema = SchemaFactory.createForClass(Quiz);
