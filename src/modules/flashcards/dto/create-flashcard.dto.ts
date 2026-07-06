import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FlashcardType } from '../../../common/enums/app.enums';

export class CreateFlashcardDto {
  @ApiProperty()
  @IsString()
  packId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chapterId?: string;

  @ApiPropertyOptional({ enum: FlashcardType })
  @IsOptional()
  @IsEnum(FlashcardType)
  type?: FlashcardType;

  @ApiProperty()
  @IsString()
  frontText: string;

  @ApiProperty()
  @IsString()
  backText: string;
}
