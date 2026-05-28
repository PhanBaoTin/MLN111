import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizService } from './quiz.service';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  create(@Body() dto: CreateQuizDto) {
    return this.quizService.create(dto);
  }

  /**
   * Parse a .docx Word file and return extracted questions as JSON.
   * Expects multipart/form-data with field name "file".
   *
   * Supported format in the Word doc:
   *   Question text (line starting with a number/dot OR any plain paragraph)
   *   A) option text
   *   B) option text
   *   C) option text
   *   D) option text
   *   Answer: A           ← marks correct answer (also accepts Đáp án: A)
   *   (blank line separates questions)
   */
  @Post('parse-docx')
  @UseInterceptors(FileInterceptor('file'))
  async parseDocx(@UploadedFile() file: Express.Multer.File): Promise<{ questions: unknown[]; warnings: string[] }> {
    return this.quizService.parseDocx(file.buffer);
  }

  @Get()
  findAll() {
    return this.quizService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQuizDto) {
    return this.quizService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizService.remove(id);
  }
}
