import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { LearningPackEntity } from './learning-pack.entity';

@Entity({ name: 'pack_knowledge_points' })
export class PackKnowledgePointEntity extends AbstractEntity {
  @Column({ name: 'pack_id' })
  packId: string;

  @Column({ name: 'chapter_id', type: 'char', length: 36, nullable: true })
  chapterId?: string | null;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tags?: string | null;

  @ManyToOne(() => LearningPackEntity, (pack) => pack.knowledgePoints)
  @JoinColumn({ name: 'pack_id' })
  pack: LearningPackEntity;
}
