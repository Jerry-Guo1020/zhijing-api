import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { LearningPackEntity } from '../../learning-packs/entities/learning-pack.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'qa_records' })
export class QaRecordEntity extends AbstractEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'pack_id' })
  packId: string;

  @Column({ name: 'chapter_id', type: 'char', length: 36, nullable: true })
  chapterId?: string | null;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'longtext' })
  answer: string;

  @Column({ name: 'source_references', type: 'longtext', nullable: true })
  sourceReferences?: string | null;

  @Column({ name: 'is_favorite', type: 'boolean', default: false })
  isFavorite: boolean;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => LearningPackEntity, (pack) => pack.qaRecords)
  @JoinColumn({ name: 'pack_id' })
  pack: LearningPackEntity;
}
