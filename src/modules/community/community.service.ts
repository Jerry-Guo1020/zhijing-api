import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityCommentEntity } from './entities/community-comment.entity';
import { CommunityLikeEntity } from './entities/community-like.entity';
import { CommunityPostEntity } from './entities/community-post.entity';
import { CreateCommunityCommentDto } from './dto/create-community-comment.dto';
import { CreateCommunityLikeDto } from './dto/create-community-like.dto';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityPostEntity)
    private readonly postRepository: Repository<CommunityPostEntity>,
    @InjectRepository(CommunityCommentEntity)
    private readonly commentRepository: Repository<CommunityCommentEntity>,
    @InjectRepository(CommunityLikeEntity)
    private readonly likeRepository: Repository<CommunityLikeEntity>,
  ) {}

  findPosts() {
    return this.postRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findPostDetail(id: string) {
    const post = await this.postRepository.findOne({ where: { id } });
    const comments = await this.commentRepository.find({
      where: { postId: id },
      order: { createdAt: 'ASC' },
    });
    return { post, comments };
  }

  createPost(userId: string, dto: CreateCommunityPostDto) {
    const post = this.postRepository.create({
      userId,
      type: dto.type,
      title: dto.title,
      content: dto.content,
      packId: dto.packId,
      wrongQuestionId: dto.wrongQuestionId,
      qaRecordId: dto.qaRecordId,
    });

    return this.postRepository.save(post);
  }

  async createComment(userId: string, postId: string, dto: CreateCommunityCommentDto) {
    const comment = this.commentRepository.create({
      postId,
      userId,
      parentId: dto.parentId,
      content: dto.content ?? '',
    });

    const savedComment = await this.commentRepository.save(comment);
    await this.postRepository.increment({ id: postId }, 'commentCount', 1);
    return savedComment;
  }

  async like(userId: string, dto: CreateCommunityLikeDto) {
    const like = this.likeRepository.create({
      userId,
      targetType: dto.targetType,
      targetId: dto.targetId,
    });

    const saved = await this.likeRepository.save(like);

    if (dto.targetType === 'post') {
      await this.postRepository.increment({ id: dto.targetId }, 'likeCount', 1);
    }

    if (dto.targetType === 'comment') {
      await this.commentRepository.increment({ id: dto.targetId }, 'likeCount', 1);
    }

    return saved;
  }
}
