import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { ReplyStyle, UserStatus } from '../../../common/enums/app.enums';
import { LearningPackEntity } from '../../learning-packs/entities/learning-pack.entity';
import { CommunityPostEntity } from '../../community/entities/community-post.entity';
import { LearningTaskEntity } from '../../tasks/entities/learning-task.entity';
import { FocusRecordEntity } from '../../focus/entities/focus-record.entity';
import { UserPreferenceEntity } from './user-preference.entity';
import { TargetPlanEntity } from '../../target-plans/entities/target-plan.entity';
import { AiProviderConfigEntity } from '../../ai-settings/entities/ai-provider-config.entity';

@Entity({ name: 'users' })
export class UserEntity extends AbstractEntity {
  @Column({ length: 50, unique: true })
  nickname: string;

  @Column({ length: 100, nullable: true, unique: true })
  email?: string | null;

  @Column({ length: 20, nullable: true, unique: true })
  phone?: string | null;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'avatar_url', length: 255, nullable: true })
  avatarUrl?: string | null;

  @Column({ type: 'text', nullable: true })
  bio?: string | null;

  @Column({ name: 'study_goal', type: 'varchar', length: 255, nullable: true })
  studyGoal?: string | null;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({
    name: 'reply_style',
    type: 'enum',
    enum: ReplyStyle,
    default: ReplyStyle.DETAILED,
  })
  replyStyle: ReplyStyle;

  @OneToOne(() => UserPreferenceEntity, (preference) => preference.user)
  preference: UserPreferenceEntity;

  @OneToOne(() => AiProviderConfigEntity, (config) => config.user)
  aiProviderConfig: AiProviderConfigEntity;

  @OneToMany(() => LearningPackEntity, (pack) => pack.user)
  learningPacks: LearningPackEntity[];

  @OneToMany(() => CommunityPostEntity, (post) => post.user)
  communityPosts: CommunityPostEntity[];

  @OneToMany(() => LearningTaskEntity, (task) => task.user)
  tasks: LearningTaskEntity[];

  @OneToMany(() => FocusRecordEntity, (record) => record.user)
  focusRecords: FocusRecordEntity[];

  @OneToMany(() => TargetPlanEntity, (plan) => plan.user)
  targetPlans: TargetPlanEntity[];
}
