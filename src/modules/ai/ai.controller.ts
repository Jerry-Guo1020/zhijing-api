import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { AiService } from './ai.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { GenerateFlashcardsDto } from './dto/generate-flashcards.dto';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { ReviewWrongQuestionDto } from './dto/review-wrong-question.dto';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('qa')
  ask(@CurrentUser() user: CurrentUserPayload, @Body() dto: AskQuestionDto) {
    return this.aiService.ask(user.sub, dto);
  }

  @Post('generate-questions')
  generateQuestions(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: GenerateQuestionsDto,
  ) {
    return this.aiService.generateQuestions(user.sub, dto);
  }

  @Post('packs/:packId/generate-flashcards')
  generateFlashcards(
    @CurrentUser() user: CurrentUserPayload,
    @Param('packId') packId: string,
    @Body() dto: GenerateFlashcardsDto,
  ) {
    return this.aiService.generateFlashcards(user.sub, packId, dto);
  }

  @Post('wrong-question-review')
  reviewWrongQuestion(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ReviewWrongQuestionDto,
  ) {
    return this.aiService.reviewWrongQuestion(user.sub, dto);
  }
}
