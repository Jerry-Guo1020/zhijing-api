import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { FlashcardReviewRating } from '../../../common/enums/app.enums';

export class ReviewFlashcardDto {
  @ApiProperty({ enum: FlashcardReviewRating })
  @IsEnum(FlashcardReviewRating)
  rating: FlashcardReviewRating;
}
