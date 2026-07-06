import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { CommunityService } from './community.service';
import { CreateCommunityCommentDto } from './dto/create-community-comment.dto';
import { CreateCommunityLikeDto } from './dto/create-community-like.dto';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';

@ApiTags('Community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('posts')
  findPosts() {
    return this.communityService.findPosts();
  }

  @Get('posts/:id')
  findPostDetail(@Param('id') id: string) {
    return this.communityService.findPostDetail(id);
  }

  @Post('posts')
  createPost(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateCommunityPostDto) {
    return this.communityService.createPost(user.sub, dto);
  }

  @Post('posts/:id/comments')
  createComment(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: CreateCommunityCommentDto,
  ) {
    return this.communityService.createComment(user.sub, id, dto);
  }

  @Post('likes')
  like(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateCommunityLikeDto) {
    return this.communityService.like(user.sub, dto);
  }
}
