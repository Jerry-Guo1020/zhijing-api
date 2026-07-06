import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { PracticeSessionStatus, PracticeSessionType } from '../../../common/enums/app.enums';
import { UserEntity } from '../../users/entities/user.entity';
import { LearningPackEntity } from '../../learning-packs/entities/learning-pack.entity';
import { PracticeAnswerEntity } from './practice-answer.entity';

@Entity({ name: 'practice_sessions' })
export class PracticeSessionEntity extends AbstractEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'pack_id' })
  packId: string;

  @Column({ name: 'chapter_id', nullable: true })
  chapterId?: string | null;

  @Column({
    name: 'session_type',
    type: 'enum',
    enum: PracticeSessionType,
    default: PracticeSessionType.CHAPTER,
  })
  sessionType: PracticeSessionType;

  @Column({
    type: 'enum',
    enum: PracticeSessionStatus,
    default: PracticeSessionStatus.DRAFT,
  })
  status: PracticeSessionStatus;

  @Column({ name: 'question_count', type: 'int', default: 0 })
  questionCount: number;

  @Column({ name: 'correct_count', type: 'int', default: 0 })
  correctCount: number;

  @Column({ name: 'wrong_count', type: 'int', default: 0 })
  wrongCount: number;

  @Column({ name: 'accuracy_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  accuracyRate: number;

  @Column({ name: 'duration_seconds', type: 'int', default: 0 })
  durationSeconds: number;

  @Column({ name: 'submitted_at', type: 'datetime', nullable: true })
  submittedAt?: Date | null;

  @ManyToOne(() => UserEntity)
  user: UserEntity;

  @ManyToOne(() => LearningPackEntity)
  pack: LearningPackEntity;

  @OneToMany(() => PracticeAnswerEntity, (answer) => answer.session)
  answers: PracticeAnswerEntity[];
}
