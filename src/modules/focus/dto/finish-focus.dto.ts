import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FinishFocusDto {
  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(300)
  actualMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
