import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningPacksController } from './learning-packs.controller';
import { LearningPacksService } from './learning-packs.service';
import { LearningPackEntity } from './entities/learning-pack.entity';
import { PackMaterialEntity } from './entities/pack-material.entity';
import { PackChapterEntity } from './entities/pack-chapter.entity';
import { PackKnowledgePointEntity } from './entities/pack-knowledge-point.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LearningPackEntity,
      PackMaterialEntity,
      PackChapterEntity,
      PackKnowledgePointEntity,
    ]),
  ],
  controllers: [LearningPacksController],
  providers: [LearningPacksService],
  exports: [LearningPacksService],
})
export class LearningPacksModule {}
