import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { LearningPackEntity } from '../learning-packs/entities/learning-pack.entity';
import { WrongQuestionEntity } from '../wrong-book/entities/wrong-question.entity';
import { FlashcardEntity } from '../flashcards/entities/flashcard.entity';
import { FocusRecordEntity } from '../focus/entities/focus-record.entity';
import { LearningTaskEntity } from '../tasks/entities/learning-task.entity';
import { StudyStreakEntity } from '../focus/entities/study-streak.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(LearningPackEntity)
    private readonly packRepository: Repository<LearningPackEntity>,
    @InjectRepository(WrongQuestionEntity)
    private readonly wrongQuestionRepository: Repository<WrongQuestionEntity>,
    @InjectRepository(FlashcardEntity)
    private readonly flashcardRepository: Repository<FlashcardEntity>,
    @InjectRepository(FocusRecordEntity)
    private readonly focusRepository: Repository<FocusRecordEntity>,
    @InjectRepository(LearningTaskEntity)
    private readonly taskRepository: Repository<LearningTaskEntity>,
    @InjectRepository(StudyStreakEntity)
    private readonly streakRepository: Repository<StudyStreakEntity>,
  ) {}

  async getProfileDashboard(userId: string) {
    const [
      user,
      learningPackCount,
      wrongQuestionCount,
      flashcardCount,
      focusRecords,
      completedTaskCount,
      streak,
    ] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.packRepository.count({ where: { userId } }),
      this.wrongQuestionRepository.count({ where: { userId } }),
      this.flashcardRepository.count({ where: { userId } }),
      this.focusRepository.find({ where: { userId } }),
      this.taskRepository.count({ where: { userId, status: 'completed' as never } }),
      this.streakRepository.findOne({ where: { userId } }),
    ]);

    const totalFocusMinutes = focusRecords.reduce((sum, item) => sum + item.actualMinutes, 0);

    return {
      user,
      stats: {
        learningPackCount,
        wrongQuestionCount,
        flashcardCount,
        totalFocusMinutes,
        completedTaskCount,
        currentStreakDays: streak?.currentStreakDays ?? 0,
        longestStreakDays: streak?.longestStreakDays ?? 0,
      },
    };
  }
}
