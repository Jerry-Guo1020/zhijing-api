import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { PostStatus, PostType } from '../../../common/enums/app.enums';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'community_posts' })
export class CommunityPostEntity extends AbstractEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: PostType,
    default: PostType.REVIEW,
  })
  type: PostType;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ name: 'pack_id', type: 'char', length: 36, nullable: true })
  packId?: string | null;

  @Column({ name: 'wrong_question_id', type: 'char', length: 36, nullable: true })
  wrongQuestionId?: string | null;

  @Column({ name: 'qa_record_id', type: 'char', length: 36, nullable: true })
  qaRecordId?: string | null;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @Column({ name: 'comment_count', type: 'int', default: 0 })
  commentCount: number;

  @Column({
    type: 'enum',
    enum: PostStatus,
    default: PostStatus.PUBLISHED,
  })
  status: PostStatus;

  @ManyToOne(() => UserEntity, (user) => user.communityPosts)
  user: UserEntity;
}
