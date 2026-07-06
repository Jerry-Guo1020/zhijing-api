import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class SubmitPracticeAnswerDto {
  @ApiProperty()
  @IsString()
  questionId: string;

  @ApiProperty()
  @IsString()
  userAnswer: string;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isMarked?: boolean;
}

export class SubmitPracticeSessionDto {
  @ApiProperty({ type: [SubmitPracticeAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitPracticeAnswerDto)
  answers: SubmitPracticeAnswerDto[];

  @ApiProperty({ example: 1200 })
  @IsInt()
  @Min(0)
  durationSeconds: number;
}
