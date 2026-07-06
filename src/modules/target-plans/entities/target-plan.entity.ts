import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { TargetPlanStatus } from '../../../common/enums/app.enums';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'target_plans' })
export class TargetPlanEntity extends AbstractEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'college_name', length: 150 })
  collegeName: string;

  @Column({ name: 'major_name', length: 150, nullable: true })
  majorName?: string | null;

  @Column({ name: 'target_year', type: 'int', nullable: true })
  targetYear?: number | null;

  @Column({ name: 'target_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  targetScore?: number | null;

  @Column({ name: 'countdown_days', type: 'int', nullable: true })
  countdownDays?: number | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({
    type: 'enum',
    enum: TargetPlanStatus,
    default: TargetPlanStatus.ACTIVE,
  })
  status: TargetPlanStatus;

  @ManyToOne(() => UserEntity, (user) => user.targetPlans)
  user: UserEntity;
}
