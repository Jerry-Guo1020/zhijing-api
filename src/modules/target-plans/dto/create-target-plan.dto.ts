import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateTargetPlanDto {
  @ApiProperty()
  @IsString()
  collegeName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  majorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(2024)
  targetYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  targetScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  countdownDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
