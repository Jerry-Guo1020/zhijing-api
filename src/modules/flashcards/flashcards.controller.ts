import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { ReviewFlashcardDto } from './dto/review-flashcard.dto';
import { FlashcardsService } from './flashcards.service';

@ApiTags('Flashcards')
@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload, @Query('packId') packId?: string) {
    return this.flashcardsService.findAll(user.sub, packId);
  }

  @Post()
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateFlashcardDto) {
    return this.flashcardsService.create(user.sub, dto);
  }

  @Post(':id/review')
  review(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: ReviewFlashcardDto,
  ) {
    return this.flashcardsService.review(user.sub, id, dto);
  }
}
