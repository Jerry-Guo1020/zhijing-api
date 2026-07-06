import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { LikeTargetType } from '../../../common/enums/app.enums';

@Entity({ name: 'community_likes' })
export class CommunityLikeEntity extends AbstractEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    name: 'target_type',
    type: 'enum',
    enum: LikeTargetType,
  })
  targetType: LikeTargetType;

  @Column({ name: 'target_id' })
  targetId: string;
}
