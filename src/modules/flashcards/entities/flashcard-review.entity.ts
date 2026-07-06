import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { FlashcardReviewRating } from '../../../common/enums/app.enums';

@Entity({ name: 'flashcard_reviews' })
export class FlashcardReviewEntity extends AbstractEntity {
  @Column({ name: 'flashcard_id' })
  flashcardId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: FlashcardReviewRating,
  })
  rating: FlashcardReviewRating;

  @Column({ name: 'reviewed_at', type: 'datetime' })
  reviewedAt: Date;
}
