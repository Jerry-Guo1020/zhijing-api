import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { FlashcardType } from '../../../common/enums/app.enums';

export class GenerateFlashcardsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chapterId?: string;

  @ApiPropertyOptional({ enum: FlashcardType })
  @IsOptional()
  @IsEnum(FlashcardType)
  type?: FlashcardType;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  count?: number;
}
