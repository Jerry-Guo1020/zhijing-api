import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { WrongQuestionStatus } from '../../../common/enums/app.enums';

export class UpdateWrongQuestionStatusDto {
  @ApiProperty({ enum: WrongQuestionStatus })
  @IsEnum(WrongQuestionStatus)
  status: WrongQuestionStatus;
}
