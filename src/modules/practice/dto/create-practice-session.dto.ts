import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString, ArrayMinSize } from 'class-validator';
import { PracticeSessionType } from '../../../common/enums/app.enums';

export class CreatePracticeSessionDto {
  @ApiProperty()
  @IsString()
  packId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  chapterId?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  questionIds: string[];

  @ApiPropertyOptional({ enum: PracticeSessionType })
  @IsOptional()
  @IsEnum(PracticeSessionType)
  sessionType?: PracticeSessionType;
}
