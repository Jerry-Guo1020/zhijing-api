import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { WrongQuestionStatus } from '../../../common/enums/app.enums';

@Entity({ name: 'wrong_questions' })
export class WrongQuestionEntity extends AbstractEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'pack_id' })
  packId: string;

  @Column({ name: 'chapter_id', type: 'char', length: 36, nullable: true })
  chapterId?: string | null;

  @Column({ name: 'question_id' })
  questionId: string;

  @Column({ name: 'last_session_id', type: 'char', length: 36, nullable: true })
  lastSessionId?: string | null;

  @Column({ name: 'wrong_reason', type: 'varchar', length: 255, nullable: true })
  wrongReason?: string | null;

  @Column({ name: 'ai_review', type: 'longtext', nullable: true })
  aiReview?: string | null;

  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  @Column({
    type: 'enum',
    enum: WrongQuestionStatus,
    default: WrongQuestionStatus.PENDING_REVIEW,
  })
  status: WrongQuestionStatus;

  @Column({ name: 'last_wrong_at', type: 'datetime', nullable: true })
  lastWrongAt?: Date | null;
}
