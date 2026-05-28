import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { Quiz, QuizDocument } from '../modules/quiz/quiz.schema';

const sampleQuiz = {
  title: 'Reveal Race Sample',
  description: 'Sample quiz seeded for testing',
  visibility: 'public',
  questions: [
    {
      id: 'q1',
      text: 'Which planet is known as the Morning Star?',
      type: 'single_choice',
      timeLimit: 20,
      points: 100,
      order: 1,
      options: [
        { id: 'a', text: 'Venus', isCorrect: true },
        { id: 'b', text: 'Mars', isCorrect: false },
        { id: 'c', text: 'Jupiter', isCorrect: false },
        { id: 'd', text: 'Saturn', isCorrect: false },
      ],
    },
    {
      id: 'q2',
      text: 'How many continents are there?',
      type: 'single_choice',
      timeLimit: 15,
      points: 100,
      order: 2,
      options: [
        { id: 'a', text: '5', isCorrect: false },
        { id: 'b', text: '6', isCorrect: false },
        { id: 'c', text: '7', isCorrect: true },
        { id: 'd', text: '8', isCorrect: false },
      ],
    },
  ],
};

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const quizModel = app.get<Model<QuizDocument>>(getModelToken(Quiz.name));

  await quizModel.deleteMany({ title: sampleQuiz.title }).exec();
  const created = await quizModel.create(sampleQuiz);
  // eslint-disable-next-line no-console
  console.log('Seeded quiz:', created.id);
  await app.close();
}

bootstrap();
