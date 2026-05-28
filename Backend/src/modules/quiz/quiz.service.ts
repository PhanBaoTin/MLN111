import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { ParsedQuestion } from './types/parsed-question';
import { randomUUID } from 'crypto';
import * as mammoth from 'mammoth';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Quiz, QuizDocument } from './quiz.schema';

@Injectable()
export class QuizService {
  constructor(@InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>) {}

  async create(dto: CreateQuizDto) {
    return this.quizModel.create(dto);
  }

  async findAll() {
    // Return list without the (potentially large) imageBase64 field
    return this.quizModel.find().select('-imageBase64').exec();
  }

  async findById(id: string) {
    const quiz = await this.quizModel.findById(id).exec();
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async update(id: string, dto: UpdateQuizDto) {
    const quiz = await this.quizModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async remove(id: string) {
    const quiz = await this.quizModel.findByIdAndDelete(id).exec();
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  // ─── Word (.docx) import ──────────────────────────────────────────────────

  /**
   * Parse a .docx buffer and extract questions.
   *
   * Supported Word format (flexible, handles Vietnamese):
   *
   *   Câu 1: Which planet is known as the Morning Star?   ← or plain paragraph
   *   A. Venus
   *   B. Mars
   *   C. Jupiter
   *   D. Saturn
   *   Đáp án: A            ← or "Answer: A"
   *
   *   Câu 2: ...
   *
   * Returns array of question objects ready to paste into CreateQuizDto.
   */
  async parseDocx(buffer: Buffer): Promise<{ questions: ParsedQuestion[]; warnings: string[] }> {
    const result = await mammoth.extractRawText({ buffer });
    const raw: string = result.value;
    const rawWarnings: string[] = result.messages.map((m: { message: string }) => m.message);

    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    const questions: Array<{
      id: string;
      text: string;
      type: 'single_choice';
      timeLimit: number;
      points: number;
      order: number;
      options: Array<{ id: string; text: string; isCorrect: boolean }>;
    }> = [];

    const OPTION_REGEX = /^([A-Da-d])[.):]\s+(.+)$/;
    const ANSWER_REGEX = /^(?:đáp án|answer|correct)[:\s]+([A-Da-d])/i;
    const QUESTION_PREFIX = /^(?:câu\s*\d+[.:]?\s*|\d+[.)]\s*)/i;

    let currentQuestion: (typeof questions)[number] | null = null;
    let order = 0;

    const flush = () => {
      if (currentQuestion && currentQuestion.text && currentQuestion.options.length >= 2) {
        questions.push(currentQuestion);
        order++;
      }
      currentQuestion = null;
    };

    for (const line of lines) {
      const optionMatch = OPTION_REGEX.exec(line);
      const answerMatch = ANSWER_REGEX.exec(line);

      if (answerMatch) {
        // Mark correct option
        if (currentQuestion) {
          const letter = answerMatch[1].toUpperCase();
          for (const opt of currentQuestion.options) {
            const optLetter = String.fromCharCode(65 + currentQuestion.options.indexOf(opt));
            opt.isCorrect = optLetter === letter;
          }
        }
      } else if (optionMatch && currentQuestion) {
        // A/B/C/D option line
        currentQuestion.options.push({
          id: randomUUID(),
          text: optionMatch[2].trim(),
          isCorrect: false,
        });
      } else {
        // Potential question text
        const isNewQuestion =
          QUESTION_PREFIX.test(line) ||
          (!optionMatch && !answerMatch && currentQuestion === null) ||
          (!optionMatch && !answerMatch && currentQuestion?.options.length === 0 === false);

        if (isNewQuestion && !optionMatch) {
          flush();
          currentQuestion = {
            id: randomUUID(),
            text: line.replace(QUESTION_PREFIX, '').trim(),
            type: 'single_choice',
            timeLimit: 30,
            points: 100,
            order,
            options: [],
          };
        }
      }
    }

    flush();

    return { questions, warnings: rawWarnings };
  }
}
