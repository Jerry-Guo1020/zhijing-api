import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { QuestionDifficulty, ReplyStyle } from '../../../common/enums/app.enums';

export class UpdatePreferenceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(10)
  @Max(1440)
  dailyStudyMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(180)
  defaultFocusMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  defaultQuestionCount?: number;

  @ApiPropertyOptional({ enum: QuestionDifficulty })
  @IsOptional()
  @IsEnum(QuestionDifficulty)
  defaultQuestionDifficulty?: QuestionDifficulty;

  @ApiPropertyOptional({ enum: ReplyStyle })
  @IsOptional()
  @IsEnum(ReplyStyle)
  replyStyle?: ReplyStyle;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  preferContextOnly?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoFollowUp?: boolean;

  @ApiPropertyOptional({ example: '20:30' })
  @IsOptional()
  reviewReminderTime?: string;
}
