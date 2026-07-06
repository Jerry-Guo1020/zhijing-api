import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyStreakEntity } from '../focus/entities/study-streak.entity';
import { FocusRecordEntity } from '../focus/entities/focus-record.entity';
import { LearningTaskEntity } from '../tasks/entities/learning-task.entity';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(StudyStreakEntity)
    private readonly streakRepository: Repository<StudyStreakEntity>,
    @InjectRepository(FocusRecordEntity)
    private readonly focusRepository: Repository<FocusRecordEntity>,
    @InjectRepository(LearningTaskEntity)
    private readonly taskRepository: Repository<LearningTaskEntity>,
  ) {}

  async getOverview() {
    const [streaks, focusRecords, tasks] = await Promise.all([
      this.streakRepository.find({ order: { currentStreakDays: 'DESC' }, take: 20 }),
      this.focusRepository.find({ order: { actualMinutes: 'DESC' }, take: 20 }),
      this.taskRepository.find({ order: { currentValue: 'DESC' }, take: 20 }),
    ]);

    return {
      streakRanking: streaks,
      focusRanking: focusRecords,
      taskRanking: tasks,
    };
  }
}
