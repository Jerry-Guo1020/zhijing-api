import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyStreakEntity } from '../focus/entities/study-streak.entity';
import { FocusRecordEntity } from '../focus/entities/focus-record.entity';
import { LearningTaskEntity } from '../tasks/entities/learning-task.entity';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudyStreakEntity,
      FocusRecordEntity,
      LearningTaskEntity,
    ]),
  ],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}
