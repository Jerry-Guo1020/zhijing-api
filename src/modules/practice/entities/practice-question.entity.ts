import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { QuestionDifficulty, QuestionType } from '../../../common/enums/app.enums';
import { LearningPackEntity } from '../../learning-packs/entities/learning-pack.entity';
import { PracticeAnswerEntity } from './practice-answer.entity';

@Entity({ name: 'practice_questions' })
export class PracticeQuestionEntity extends AbstractEntity {
  @Column({ name: 'pack_id' })
  packId: string;

  @Column({ name: 'chapter_id', nullable: true })
  chapterId?: string | null;

  @Column({
    name: 'question_type',
    type: 'enum',
    enum: QuestionType,
  })
  questionType: QuestionType;

  @Column({
    type: 'enum',
    enum: QuestionDifficulty,
    default: QuestionDifficulty.MEDIUM,
  })
  difficulty: QuestionDifficulty;

  @Column({ type: 'longtext' })
  stem: string;

  @Column({ type: 'longtext', nullable: true })
  options?: string | null;

  @Column({ name: 'correct_answer', type: 'longtext', nullable: true })
  correctAnswer?: string | null;

  @Column({ type: 'longtext', nullable: true })
  explanation?: string | null;

  @Column({ name: 'source_excerpt', type: 'longtext', nullable: true })
  sourceExcerpt?: string | null;

  @Column({ name: 'knowledge_point_tags', type: 'varchar', length: 255, nullable: true })
  knowledgePointTags?: string | null;

  @ManyToOne(() => LearningPackEntity, (pack) => pack.practiceQuestions)
  pack: LearningPackEntity;

  @OneToMany(() => PracticeAnswerEntity, (answer) => answer.question)
  answers: PracticeAnswerEntity[];
}
