import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AskQuestionDto {
  @ApiProperty()
  @IsString()
  packId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chapterId?: string;

  @ApiProperty()
  @IsString()
  question: string;
}
