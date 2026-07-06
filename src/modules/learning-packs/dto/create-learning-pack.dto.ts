import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PackStatus } from '../../../common/enums/app.enums';

export class CreateLearningPackDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  studyGoal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subjectName?: string;

  @ApiPropertyOptional({ enum: PackStatus })
  @IsOptional()
  @IsEnum(PackStatus)
  status?: PackStatus;
}
