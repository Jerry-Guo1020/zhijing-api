import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { PracticeQuestionEntity } from './practice-question.entity';
import { PracticeSessionEntity } from './practice-session.entity';

@Entity({ name: 'practice_answers' })
export class PracticeAnswerEntity extends AbstractEntity {
  @Column({ name: 'session_id' })
  sessionId: string;

  @Column({ name: 'question_id' })
  questionId: string;

  @Column({ name: 'user_answer', type: 'longtext', nullable: true })
  userAnswer?: string | null;

  @Column({ name: 'is_correct', type: 'boolean', default: false })
  isCorrect: boolean;

  @Column({ name: 'is_marked', type: 'boolean', default: false })
  isMarked: boolean;

  @Column({ name: 'ai_explanation', type: 'longtext', nullable: true })
  aiExplanation?: string | null;

  @ManyToOne(() => PracticeSessionEntity, (session) => session.answers)
  session: PracticeSessionEntity;

  @ManyToOne(() => PracticeQuestionEntity, (question) => question.answers)
  question: PracticeQuestionEntity;
}
