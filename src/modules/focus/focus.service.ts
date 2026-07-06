import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinishFocusDto } from './dto/finish-focus.dto';
import { StartFocusDto } from './dto/start-focus.dto';
import { FocusRecordEntity } from './entities/focus-record.entity';
import { StudyStreakEntity } from './entities/study-streak.entity';
import { FocusStatus } from '../../common/enums/app.enums';

@Injectable()
export class FocusService {
  constructor(
    @InjectRepository(FocusRecordEntity)
    private readonly focusRepository: Repository<FocusRecordEntity>,
    @InjectRepository(StudyStreakEntity)
    private readonly streakRepository: Repository<StudyStreakEntity>,
  ) {}

  findAll(userId: string) {
    return this.focusRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  start(userId: string, dto: StartFocusDto) {
    const record = this.focusRepository.create({
      userId,
      taskId: dto.taskId,
      packId: dto.packId,
      plannedMinutes: dto.plannedMinutes ?? 25,
      actualMinutes: 0,
      status: FocusStatus.ONGOING,
      startedAt: new Date(),
    });

    return this.focusRepository.save(record);
  }

  async finish(userId: string, id: string, dto: FinishFocusDto) {
    const record = await this.focusRepository.findOne({ where: { id, userId } });
    if (!record) {
      return null;
    }

    record.actualMinutes = dto.actualMinutes ?? record.plannedMinutes;
    record.status = FocusStatus.COMPLETED;
    record.endedAt = new Date();
    record.note = dto.note;

    await this.updateStudyStreak(userId);
    return this.focusRepository.save(record);
  }

  async getStreak(userId: string) {
    return this.streakRepository.findOne({ where: { userId } });
  }

  private async updateStudyStreak(userId: string) {
    const today = new Date();
    const todayString = today.toISOString().slice(0, 10);
    const streak = await this.streakRepository.findOne({ where: { userId } });

    if (!streak) {
      await this.streakRepository.save(
        this.streakRepository.create({
          userId,
          currentStreakDays: 1,
          longestStreakDays: 1,
          totalStudyDays: 1,
          lastStudyDate: todayString,
        }),
      );
      return;
    }

    if (streak.lastStudyDate === todayString) {
      return;
    }

    const previousDate = streak.lastStudyDate ? new Date(streak.lastStudyDate) : null;
    const diffDays = previousDate
      ? Math.floor((today.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    streak.currentStreakDays = diffDays === 1 ? streak.currentStreakDays + 1 : 1;
    streak.longestStreakDays = Math.max(streak.longestStreakDays, streak.currentStreakDays);
    streak.totalStudyDays += 1;
    streak.lastStudyDate = todayString;

    await this.streakRepository.save(streak);
  }
}
