import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { FocusStatus } from '../../../common/enums/app.enums';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'focus_records' })
export class FocusRecordEntity extends AbstractEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'task_id', nullable: true })
  taskId?: string | null;

  @Column({ name: 'pack_id', nullable: true })
  packId?: string | null;

  @Column({ name: 'planned_minutes', type: 'int', default: 25 })
  plannedMinutes: number;

  @Column({ name: 'actual_minutes', type: 'int', default: 0 })
  actualMinutes: number;

  @Column({
    type: 'enum',
    enum: FocusStatus,
    default: FocusStatus.ONGOING,
  })
  status: FocusStatus;

  @Column({ name: 'started_at', type: 'datetime' })
  startedAt: Date;

  @Column({ name: 'ended_at', type: 'datetime', nullable: true })
  endedAt?: Date | null;

  @Column({ type: 'text', nullable: true })
  note?: string | null;

  @ManyToOne(() => UserEntity, (user) => user.focusRecords)
  user: UserEntity;
}
