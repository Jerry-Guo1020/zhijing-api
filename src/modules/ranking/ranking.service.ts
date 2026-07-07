import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskStatus } from '../../common/enums/app.enums';
import { StudyStreakEntity } from '../focus/entities/study-streak.entity';
import { FocusRecordEntity } from '../focus/entities/focus-record.entity';
import { LearningTaskEntity } from '../tasks/entities/learning-task.entity';
import { UserEntity } from '../users/entities/user.entity';

type RankingUser = {
  userId: string;
  nickname: string;
  email?: string | null;
  avatarUrl?: string | null;
  totalFocusMinutes: number;
  currentStreakDays: number;
  completedTaskCount: number;
  score: number;
  rank: number;
};

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(StudyStreakEntity)
    private readonly streakRepository: Repository<StudyStreakEntity>,
    @InjectRepository(FocusRecordEntity)
    private readonly focusRepository: Repository<FocusRecordEntity>,
    @InjectRepository(LearningTaskEntity)
    private readonly taskRepository: Repository<LearningTaskEntity>,
  ) {}

  async getOverview() {
    const [users, streaks, focusRows, taskRows] = await Promise.all([
      this.userRepository.find({
        select: {
          id: true,
          nickname: true,
          email: true,
          avatarUrl: true,
          createdAt: true,
        },
        order: { createdAt: 'ASC' },
      }),
      this.streakRepository.find(),
      this.focusRepository
        .createQueryBuilder('focus')
        .select('focus.userId', 'userId')
        .addSelect('COALESCE(SUM(focus.actualMinutes), 0)', 'totalFocusMinutes')
        .groupBy('focus.userId')
        .getRawMany<{ userId: string; totalFocusMinutes: string }>(),
      this.taskRepository
        .createQueryBuilder('task')
        .select('task.userId', 'userId')
        .addSelect('COUNT(task.id)', 'completedTaskCount')
        .where('task.status = :status', { status: TaskStatus.COMPLETED })
        .groupBy('task.userId')
        .getRawMany<{ userId: string; completedTaskCount: string }>(),
    ]);

    const streakByUser = new Map(streaks.map((item) => [item.userId, item]));
    const focusByUser = new Map(
      focusRows.map((item) => [item.userId, Number(item.totalFocusMinutes) || 0]),
    );
    const tasksByUser = new Map(
      taskRows.map((item) => [item.userId, Number(item.completedTaskCount) || 0]),
    );

    const usersRanking: RankingUser[] = users
      .map((user) => {
        const totalFocusMinutes = focusByUser.get(user.id) ?? 0;
        const currentStreakDays = streakByUser.get(user.id)?.currentStreakDays ?? 0;
        const completedTaskCount = tasksByUser.get(user.id) ?? 0;
        const score = totalFocusMinutes + currentStreakDays * 30 + completedTaskCount * 20;

        return {
          userId: user.id,
          nickname: user.nickname,
          email: user.email,
          avatarUrl: user.avatarUrl,
          totalFocusMinutes,
          currentStreakDays,
          completedTaskCount,
          score,
          rank: 0,
        };
      })
      .sort((a, b) => b.score - a.score || a.nickname.localeCompare(b.nickname))
      .slice(0, 20)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    return {
      users: usersRanking,
      streakRanking: usersRanking
        .slice()
        .sort((a, b) => b.currentStreakDays - a.currentStreakDays || a.rank - b.rank),
      focusRanking: usersRanking
        .slice()
        .sort((a, b) => b.totalFocusMinutes - a.totalFocusMinutes || a.rank - b.rank),
      taskRanking: usersRanking
        .slice()
        .sort((a, b) => b.completedTaskCount - a.completedTaskCount || a.rank - b.rank),
    };
  }
}
