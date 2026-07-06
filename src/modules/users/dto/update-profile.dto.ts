import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReplyStyle } from '../../../common/enums/app.enums';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  studyGoal?: string;

  @ApiPropertyOptional({ enum: ReplyStyle })
  @IsOptional()
  @IsEnum(ReplyStyle)
  replyStyle?: ReplyStyle;
}
