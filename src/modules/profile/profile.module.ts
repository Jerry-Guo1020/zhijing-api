import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { LearningPackEntity } from '../learning-packs/entities/learning-pack.entity';
import { WrongQuestionEntity } from '../wrong-book/entities/wrong-question.entity';
import { FlashcardEntity } from '../flashcards/entities/flashcard.entity';
import { FocusRecordEntity } from '../focus/entities/focus-record.entity';
import { LearningTaskEntity } from '../tasks/entities/learning-task.entity';
import { StudyStreakEntity } from '../focus/entities/study-streak.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      LearningPackEntity,
      WrongQuestionEntity,
      FlashcardEntity,
      FocusRecordEntity,
      LearningTaskEntity,
      StudyStreakEntity,
    ]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
