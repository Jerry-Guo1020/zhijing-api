import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlashcardEntity } from './entities/flashcard.entity';
import { FlashcardReviewEntity } from './entities/flashcard-review.entity';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';

@Module({
  imports: [TypeOrmModule.forFeature([FlashcardEntity, FlashcardReviewEntity])],
  controllers: [FlashcardsController],
  providers: [FlashcardsService],
  exports: [FlashcardsService],
})
export class FlashcardsModule {}
