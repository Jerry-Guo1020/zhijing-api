import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { AiSettingsService } from './ai-settings.service';
import { TestAiProviderConfigDto } from './dto/test-ai-provider-config.dto';
import { UpdateAiProviderConfigDto } from './dto/update-ai-provider-config.dto';

@ApiTags('AI Settings')
@Controller('ai/settings')
export class AiSettingsController {
  constructor(private readonly aiSettingsService: AiSettingsService) {}

  @Get()
  getConfig(@CurrentUser() user: CurrentUserPayload) {
    return this.aiSettingsService.getConfig(user.sub);
  }

  @Put()
  updateConfig(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateAiProviderConfigDto,
  ) {
    return this.aiSettingsService.upsertConfig(user.sub, dto);
  }

  @Post('test')
  testConfig(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: TestAiProviderConfigDto = {},
  ) {
    return this.aiSettingsService.testConfig(user.sub, dto);
  }
}
