import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuizOptionDto, CreateQuizQuestionDto } from '../../quiz/dto/create-quiz.dto';

export class QuickCreateRoomDto {
  // ── Quiz fields ─────────────────────────────────────────────────
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageBase64?: string;

  @IsIn(['public', 'private'])
  @IsOptional()
  visibility?: 'public' | 'private';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionDto)
  questions: CreateQuizQuestionDto[];

  // ── Room fields ─────────────────────────────────────────────────
  @IsString()
  pin: string;

  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;

  @IsOptional()
  @IsBoolean()
  shuffleOptions?: boolean;

  @IsOptional()
  @IsInt()
  @Min(2)
  maxTeams?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  globalTimeLimit?: number;
}
