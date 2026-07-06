import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { PackStatus } from '../../../common/enums/app.enums';
import { UserEntity } from '../../users/entities/user.entity';
import { PackMaterialEntity } from './pack-material.entity';
import { PackChapterEntity } from './pack-chapter.entity';
import { PackKnowledgePointEntity } from './pack-knowledge-point.entity';
import { QaRecordEntity } from '../../ai/entities/qa-record.entity';
import { PracticeQuestionEntity } from '../../practice/entities/practice-question.entity';
import { FlashcardEntity } from '../../flashcards/entities/flashcard.entity';

@Entity({ name: 'learning_packs' })
export class LearningPackEntity extends AbstractEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 120 })
  title: string;

  @Column({ name: 'study_goal', type: 'varchar', length: 255, nullable: true })
  studyGoal?: string | null;

  @Column({ name: 'subject_name', type: 'varchar', length: 100, nullable: true })
  subjectName?: string | null;

  @Column({
    type: 'enum',
    enum: PackStatus,
    default: PackStatus.DRAFT,
  })
  status: PackStatus;

  @Column({ name: 'mastery_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  masteryRate: number;

  @Column({ name: 'last_studied_at', type: 'datetime', nullable: true })
  lastStudiedAt?: Date | null;

  @ManyToOne(() => UserEntity, (user) => user.learningPacks)
  user: UserEntity;

  @OneToMany(() => PackMaterialEntity, (material) => material.pack)
  materials: PackMaterialEntity[];

  @OneToMany(() => PackChapterEntity, (chapter) => chapter.pack)
  chapters: PackChapterEntity[];

  @OneToMany(() => PackKnowledgePointEntity, (point) => point.pack)
  knowledgePoints: PackKnowledgePointEntity[];

  @OneToMany(() => QaRecordEntity, (record) => record.pack)
  qaRecords: QaRecordEntity[];

  @OneToMany(() => PracticeQuestionEntity, (question) => question.pack)
  practiceQuestions: PracticeQuestionEntity[];

  @OneToMany(() => FlashcardEntity, (flashcard) => flashcard.pack)
  flashcards: FlashcardEntity[];
}
