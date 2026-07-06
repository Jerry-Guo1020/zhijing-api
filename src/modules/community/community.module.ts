import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityCommentEntity } from './entities/community-comment.entity';
import { CommunityLikeEntity } from './entities/community-like.entity';
import { CommunityPostEntity } from './entities/community-post.entity';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityPostEntity,
      CommunityCommentEntity,
      CommunityLikeEntity,
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
