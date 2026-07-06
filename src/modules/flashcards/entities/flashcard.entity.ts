import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import {
  FlashcardMasteryLevel,
  FlashcardReviewStatus,
  FlashcardType,
} from '../../../common/enums/app.enums';
import { LearningPackEntity } from '../../learning-packs/entities/learning-pack.entity';

@Entity({ name: 'flashcards' })
export class FlashcardEntity extends AbstractEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'pack_id' })
  packId: string;

  @Column({ name: 'chapter_id', type: 'char', length: 36, nullable: true })
  chapterId?: string | null;

  @Column({
    type: 'enum',
    enum: FlashcardType,
    default: FlashcardType.CUSTOM,
  })
  type: FlashcardType;

  @Column({ name: 'front_text', type: 'text' })
  frontText: string;

  @Column({ name: 'back_text', type: 'longtext' })
  backText: string;

  @Column({
    name: 'mastery_level',
    type: 'enum',
    enum: FlashcardMasteryLevel,
    default: FlashcardMasteryLevel.NEW,
  })
  masteryLevel: FlashcardMasteryLevel;

  @Column({
    name: 'review_status',
    type: 'enum',
    enum: FlashcardReviewStatus,
    default: FlashcardReviewStatus.DUE,
  })
  reviewStatus: FlashcardReviewStatus;

  @Column({ name: 'source_excerpt', type: 'longtext', nullable: true })
  sourceExcerpt?: string | null;

  @Column({ name: 'next_review_at', type: 'datetime', nullable: true })
  nextReviewAt?: Date | null;

  @ManyToOne(() => LearningPackEntity, (pack) => pack.flashcards)
  pack: LearningPackEntity;
}
