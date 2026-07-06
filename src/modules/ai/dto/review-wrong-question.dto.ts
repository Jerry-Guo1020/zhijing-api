import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReviewWrongQuestionDto {
  @ApiProperty()
  @IsString()
  wrongQuestionId: string;
}
