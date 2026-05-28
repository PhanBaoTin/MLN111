import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { QuizController } from './quiz.controller';
import { Quiz, QuizSchema } from './quiz.schema';
import { QuizService } from './quiz.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }]),
    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }), // 10 MB
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [MongooseModule, QuizService],
})
export class QuizModule {}
