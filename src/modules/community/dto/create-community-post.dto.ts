import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PostType } from '../../../common/enums/app.enums';

export class CreateCommunityPostDto {
  @ApiProperty({ enum: PostType })
  @IsEnum(PostType)
  type: PostType;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  packId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  wrongQuestionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  qaRecordId?: string;
}
