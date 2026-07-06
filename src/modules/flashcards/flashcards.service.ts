import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { ReviewFlashcardDto } from './dto/review-flashcard.dto';
import { FlashcardEntity } from './entities/flashcard.entity';
import { FlashcardReviewEntity } from './entities/flashcard-review.entity';
import {
  FlashcardMasteryLevel,
  FlashcardReviewRating,
  FlashcardReviewStatus,
} from '../../common/enums/app.enums';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(FlashcardEntity)
    private readonly flashcardRepository: Repository<FlashcardEntity>,
    @InjectRepository(FlashcardReviewEntity)
    private readonly reviewRepository: Repository<FlashcardReviewEntity>,
  ) {}

  findAll(userId: string, packId?: string) {
    return this.flashcardRepository.find({
      where: packId ? { userId, packId } : { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  create(userId: string, dto: CreateFlashcardDto) {
    const flashcard = this.flashcardRepository.create({
      userId,
      packId: dto.packId,
      chapterId: dto.chapterId,
      type: dto.type,
      frontText: dto.frontText,
      backText: dto.backText,
    });

    return this.flashcardRepository.save(flashcard);
  }

  async review(userId: string, flashcardId: string, dto: ReviewFlashcardDto) {
    const flashcard = await this.flashcardRepository.findOne({
      where: { id: flashcardId, userId },
    });

    if (!flashcard) {
      return null;
    }

    const review = this.reviewRepository.create({
      flashcardId,
      userId,
      rating: dto.rating,
      reviewedAt: new Date(),
    });
    await this.reviewRepository.save(review);

    flashcard.masteryLevel = this.mapRatingToMastery(dto.rating);
    flashcard.reviewStatus = FlashcardReviewStatus.REVIEWED;
    flashcard.nextReviewAt = this.computeNextReviewDate(dto.rating);

    return this.flashcardRepository.save(flashcard);
  }

  private mapRatingToMastery(rating: FlashcardReviewRating) {
    switch (rating) {
      case FlashcardReviewRating.UNKNOWN:
        return FlashcardMasteryLevel.NEW;
      case FlashcardReviewRating.VAGUE:
        return FlashcardMasteryLevel.VAGUE;
      case FlashcardReviewRating.REMEMBERED:
        return FlashcardMasteryLevel.FAMILIAR;
      case FlashcardReviewRating.MASTERED:
        return FlashcardMasteryLevel.MASTERED;
      default:
        return FlashcardMasteryLevel.NEW;
    }
  }

  private computeNextReviewDate(rating: FlashcardReviewRating) {
    const date = new Date();
    const dayOffset =
      rating === FlashcardReviewRating.UNKNOWN
        ? 1
        : rating === FlashcardReviewRating.VAGUE
          ? 2
          : rating === FlashcardReviewRating.REMEMBERED
            ? 4
            : 7;
    date.setDate(date.getDate() + dayOffset);
    return date;
  }
}
