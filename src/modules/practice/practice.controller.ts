import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { CreatePracticeSessionDto } from './dto/create-practice-session.dto';
import { SubmitPracticeSessionDto } from './dto/submit-practice-session.dto';
import { PracticeService } from './practice.service';

@ApiTags('Practice')
@Controller('practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Get('questions')
  findQuestions(@Query('packId') packId: string, @Query('chapterId') chapterId?: string) {
    return this.practiceService.findQuestions(packId, chapterId);
  }

  @Post('sessions')
  createSession(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreatePracticeSessionDto,
  ) {
    return this.practiceService.createSession(user.sub, dto);
  }

  @Get('sessions/:id')
  getSessionDetail(@Param('id') id: string) {
    return this.practiceService.getSessionDetail(id);
  }

  @Post('sessions/:id/submit')
  submitSession(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: SubmitPracticeSessionDto,
  ) {
    return this.practiceService.submitSession(user.sub, id, dto);
  }
}
