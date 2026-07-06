import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: '小郭同学' })
  @IsString()
  nickname: string;

  @ApiPropertyOptional({ example: 'student@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '13800138000' })
  @IsOptional()
  @IsPhoneNumber('CN')
  phone?: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: '考研英语强化' })
  @IsOptional()
  @IsString()
  studyGoal?: string;
}
