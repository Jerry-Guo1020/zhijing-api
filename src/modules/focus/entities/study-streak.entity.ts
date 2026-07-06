import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';

@Entity({ name: 'study_streaks' })
export class StudyStreakEntity extends AbstractEntity {
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ name: 'current_streak_days', type: 'int', default: 0 })
  currentStreakDays: number;

  @Column({ name: 'longest_streak_days', type: 'int', default: 0 })
  longestStreakDays: number;

  @Column({ name: 'total_study_days', type: 'int', default: 0 })
  totalStudyDays: number;

  @Column({ name: 'last_study_date', type: 'date', nullable: true })
  lastStudyDate?: string | null;
}
