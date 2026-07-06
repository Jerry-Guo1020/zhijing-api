import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { CommentStatus } from '../../../common/enums/app.enums';

@Entity({ name: 'community_comments' })
export class CommunityCommentEntity extends AbstractEntity {
  @Column({ name: 'post_id' })
  postId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'parent_id', type: 'char', length: 36, nullable: true })
  parentId?: string | null;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ name: 'like_count', type: 'int', default: 0 })
  likeCount: number;

  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.PUBLISHED,
  })
  status: CommentStatus;
}
