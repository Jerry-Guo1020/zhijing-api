import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { PracticeQuestionEntity } from './entities/practice-question.entity';
import { PracticeSessionEntity } from './entities/practice-session.entity';
import { PracticeAnswerEntity } from './entities/practice-answer.entity';
import { WrongQuestionEntity } from '../wrong-book/entities/wrong-question.entity';
import { StudyStreakEntity } from '../focus/entities/study-streak.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PracticeQuestionEntity,
      PracticeSessionEntity,
      PracticeAnswerEntity,
      WrongQuestionEntity,
      StudyStreakEntity,
    ]),
  ],
  controllers: [PracticeController],
  providers: [PracticeService],
  exports: [PracticeService],
})
export class PracticeModule {}
