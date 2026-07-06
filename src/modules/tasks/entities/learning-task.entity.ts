import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { TaskStatus, TaskType } from '../../../common/enums/app.enums';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'learning_tasks' })
export class LearningTaskEntity extends AbstractEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 120 })
  title: string;

  @Column({
    type: 'enum',
    enum: TaskType,
    default: TaskType.CUSTOM,
  })
  type: TaskType;

  @Column({ name: 'pack_id', type: 'char', length: 36, nullable: true })
  packId?: string | null;

  @Column({ name: 'chapter_id', type: 'char', length: 36, nullable: true })
  chapterId?: string | null;

  @Column({ name: 'target_value', type: 'int', default: 1 })
  targetValue: number;

  @Column({ name: 'current_value', type: 'int', default: 0 })
  currentValue: number;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({ name: 'deadline_at', type: 'datetime', nullable: true })
  deadlineAt?: Date | null;

  @Column({ name: 'reminder_at', type: 'datetime', nullable: true })
  reminderAt?: Date | null;

  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt?: Date | null;

  @ManyToOne(() => UserEntity, (user) => user.tasks)
  user: UserEntity;
}
