import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { QuestionDifficulty, ReplyStyle } from '../../../common/enums/app.enums';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_preferences' })
export class UserPreferenceEntity extends AbstractEntity {
  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ name: 'daily_study_minutes', type: 'int', default: 60 })
  dailyStudyMinutes: number;

  @Column({ name: 'default_focus_minutes', type: 'int', default: 25 })
  defaultFocusMinutes: number;

  @Column({ name: 'default_question_count', type: 'int', default: 10 })
  defaultQuestionCount: number;

  @Column({
    name: 'default_question_difficulty',
    type: 'enum',
    enum: QuestionDifficulty,
    default: QuestionDifficulty.MEDIUM,
  })
  defaultQuestionDifficulty: QuestionDifficulty;

  @Column({
    name: 'reply_style',
    type: 'enum',
    enum: ReplyStyle,
    default: ReplyStyle.DETAILED,
  })
  replyStyle: ReplyStyle;

  @Column({ name: 'prefer_context_only', type: 'boolean', default: true })
  preferContextOnly: boolean;

  @Column({ name: 'auto_follow_up', type: 'boolean', default: true })
  autoFollowUp: boolean;

  @Column({ name: 'review_reminder_time', length: 10, nullable: true })
  reviewReminderTime?: string | null;

  @OneToOne(() => UserEntity, (user) => user.preference)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
