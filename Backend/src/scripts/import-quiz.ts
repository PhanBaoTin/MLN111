import { readFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { Quiz, QuizDocument } from '../modules/quiz/quiz.schema';

function parseTsv(content: string) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const [
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctIndex,
      timeLimit,
      points,
    ] = line.split('\t');

    const options = [optionA, optionB, optionC, optionD].map((text, idx) => ({
      id: String.fromCharCode(97 + idx),
      text,
      isCorrect: String(idx + 1) === correctIndex,
    }));

    return {
      id: `q${index + 1}`,
      text: question,
      type: 'single_choice' as const,
      timeLimit: Number(timeLimit ?? 20),
      points: Number(points ?? 100),
      order: index + 1,
      options,
    };
  });
}

async function bootstrap() {
  const filePath = process.argv[2];
  const title = process.argv[3] ?? 'Imported Quiz';
  if (!filePath) {
    throw new Error('Usage: npm run import:quiz -- <path-to-tsv> [title]');
  }

  const content = readFileSync(filePath, 'utf8');
  const questions = parseTsv(content);

  const app = await NestFactory.createApplicationContext(AppModule);
  const quizModel = app.get<Model<QuizDocument>>(getModelToken(Quiz.name));

  const created = await quizModel.create({
    title,
    description: `Imported from ${filePath}`,
    visibility: 'private',
    questions,
  });

  // eslint-disable-next-line no-console
  console.log('Imported quiz:', created.id);
  await app.close();
}

bootstrap();
