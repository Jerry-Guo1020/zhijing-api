import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyStreakEntity } from '../focus/entities/study-streak.entity';
import { FocusRecordEntity } from '../focus/entities/focus-record.entity';
import { LearningTaskEntity } from '../tasks/entities/learning-task.entity';
import { UserEntity } from '../users/entities/user.entity';
import { RankingController } from './ranking.controller';
import { RankingService } from './ranking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      StudyStreakEntity,
      FocusRecordEntity,
      LearningTaskEntity,
    ]),
  ],
  controllers: [RankingController],
  providers: [RankingService],
})
export class RankingModule {}
