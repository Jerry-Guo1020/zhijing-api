import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { AddPackMaterialDto } from './dto/add-pack-material.dto';
import { CreateLearningPackDto } from './dto/create-learning-pack.dto';
import { LearningPacksService } from './learning-packs.service';

@ApiTags('Learning Packs')
@Controller('packs')
export class LearningPacksController {
  constructor(private readonly learningPacksService: LearningPacksService) {}

  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateLearningPackDto,
  ) {
    return this.learningPacksService.create(user.sub, dto);
  }

  @Get()
  findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.learningPacksService.findAllByUser(user.sub);
  }

  @Get(':id')
  findDetail(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.learningPacksService.findDetail(user.sub, id);
  }

  @Post(':id/materials')
  addMaterial(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() dto: AddPackMaterialDto,
  ) {
    return this.learningPacksService.addMaterial(user.sub, id, dto);
  }

  @Post(':id/parse')
  parse(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.learningPacksService.parseWithAi(user.sub, id);
  }
}
