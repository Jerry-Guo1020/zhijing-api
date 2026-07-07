import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { LearningPackEntity } from './learning-pack.entity';

@Entity({ name: 'pack_chapters' })
export class PackChapterEntity extends AbstractEntity {
  @Column({ name: 'pack_id' })
  packId: string;

  @Column({ name: 'parent_id', type: 'char', length: 36, nullable: true })
  parentId?: string | null;

  @Column({ length: 150 })
  title: string;

  @Column({ name: 'chapter_order', type: 'int', default: 0 })
  chapterOrder: number;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'text', nullable: true })
  summary?: string | null;

  @Column({ name: 'source_excerpt', type: 'longtext', nullable: true })
  sourceExcerpt?: string | null;

  @Column({ name: 'mastery_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  masteryRate: number;

  @ManyToOne(() => LearningPackEntity, (pack) => pack.chapters)
  @JoinColumn({ name: 'pack_id' })
  pack: LearningPackEntity;
}
