import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class TestAiProviderConfigDto {
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
}
