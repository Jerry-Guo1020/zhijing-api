import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { LikeTargetType } from '../../../common/enums/app.enums';

export class CreateCommunityLikeDto {
  @ApiProperty({ enum: LikeTargetType })
  @IsEnum(LikeTargetType)
  targetType: LikeTargetType;

  @ApiProperty()
  @IsString()
  targetId: string;
}
