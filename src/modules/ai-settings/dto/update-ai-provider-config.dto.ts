import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AiProviderType } from '../../../common/enums/app.enums';

export class UpdateAiProviderConfigDto {
  @ApiPropertyOptional({
    enum: AiProviderType,
    default: AiProviderType.OPENAI_COMPATIBLE,
  })
  @IsOptional()
  @IsEnum(AiProviderType)
  providerType?: AiProviderType;

  @ApiPropertyOptional({ example: 'DeepSeek' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  providerName?: string;

  @ApiPropertyOptional({ example: 'https://api.deepseek.com/v1' })
  @IsOptional()
  @IsUrl({ require_tld: false, require_protocol: true })
  @MaxLength(255)
  baseUrl?: string;

  @ApiPropertyOptional({ example: 'sk-xxxx' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  apiKey?: string;

  @ApiPropertyOptional({ example: 'deepseek-chat' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  modelName?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({
    description: '保存后立即测试连接，并记录最近一次测试状态',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  testConnection?: boolean;
}
