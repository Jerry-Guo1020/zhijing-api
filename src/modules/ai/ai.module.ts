import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { QaRecordEntity } from './entities/qa-record.entity';
import { PracticeQuestionEntity } from '../practice/entities/practice-question.entity';
import { FlashcardEntity } from '../flashcards/entities/flashcard.entity';
import { WrongQuestionEntity } from '../wrong-book/entities/wrong-question.entity';
import { AiSettingsModule } from '../ai-settings/ai-settings.module';
import { LearningPackEntity } from '../learning-packs/entities/learning-pack.entity';
import { PackMaterialEntity } from '../learning-packs/entities/pack-material.entity';
import { PackChapterEntity } from '../learning-packs/entities/pack-chapter.entity';

@Module({
  imports: [
    AiSettingsModule,
    TypeOrmModule.forFeature([
      QaRecordEntity,
      PracticeQuestionEntity,
      FlashcardEntity,
      WrongQuestionEntity,
      LearningPackEntity,
      PackMaterialEntity,
      PackChapterEntity,
    ]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
