import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { FinishFocusDto } from './dto/finish-focus.dto';
import { StartFocusDto } from './dto/start-focus.dto';
import { FocusService } from './focus.service';

@ApiTags('Focus')
@Controller('focus')
export class FocusController {
  constructor(private readonly focusService: FocusService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.focusService.findAll(user.sub);
  }

  @Get('streak')
  getStreak(@CurrentUser() user: CurrentUserPayload) {
    return this.focusService.getStreak(user.sub);
  }

  @Post('start')
  start(@CurrentUser() user: CurrentUserPayload, @Body() dto: StartFocusDto) {
    return this.focusService.start(user.sub, dto);
  }

  @Post(':id/finish')
  finish(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: FinishFocusDto,
  ) {
    return this.focusService.finish(user.sub, id, dto);
  }
}
