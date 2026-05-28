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

export class CreateQuizOptionDto {
  @IsString()
  id: string;

  @IsString()
  text: string;

  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuizQuestionDto {
  @IsString()
  id: string;

  @IsString()
  text: string;

  @IsIn(['single_choice'])
  type: 'single_choice';

  @IsInt()
  @Min(1)
  timeLimit: number;

  @IsInt()
  @Min(0)
  points: number;

  @IsInt()
  @Min(0)
  order: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizOptionDto)
  options: CreateQuizOptionDto[];
}

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['public', 'private'])
  visibility: 'public' | 'private';

  /** Data URL (base64) of the reveal image */
  @IsOptional()
  @IsString()
  imageBase64?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionDto)
  questions: CreateQuizQuestionDto[];
}
