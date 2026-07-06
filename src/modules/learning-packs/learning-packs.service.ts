import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLearningPackDto } from './dto/create-learning-pack.dto';
import { AddPackMaterialDto } from './dto/add-pack-material.dto';
import { LearningPackEntity } from './entities/learning-pack.entity';
import { PackMaterialEntity } from './entities/pack-material.entity';
import { PackChapterEntity } from './entities/pack-chapter.entity';
import { PackKnowledgePointEntity } from './entities/pack-knowledge-point.entity';
import { PackStatus } from '../../common/enums/app.enums';

@Injectable()
export class LearningPacksService {
  constructor(
    @InjectRepository(LearningPackEntity)
    private readonly packRepository: Repository<LearningPackEntity>,
    @InjectRepository(PackMaterialEntity)
    private readonly materialRepository: Repository<PackMaterialEntity>,
    @InjectRepository(PackChapterEntity)
    private readonly chapterRepository: Repository<PackChapterEntity>,
    @InjectRepository(PackKnowledgePointEntity)
    private readonly pointRepository: Repository<PackKnowledgePointEntity>,
  ) {}

  async create(userId: string, dto: CreateLearningPackDto) {
    const pack = this.packRepository.create({
      userId,
      title: dto.title,
      studyGoal: dto.studyGoal,
      subjectName: dto.subjectName,
      status: dto.status ?? PackStatus.DRAFT,
    });

    return this.packRepository.save(pack);
  }

  findAllByUser(userId: string) {
    return this.packRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findDetail(id: string) {
    const pack = await this.packRepository.findOne({ where: { id } });
    const materials = await this.materialRepository.find({ where: { packId: id } });
    const chapters = await this.chapterRepository.find({ where: { packId: id } });
    const knowledgePoints = await this.pointRepository.find({ where: { packId: id } });

    return { pack, materials, chapters, knowledgePoints };
  }

  async addMaterial(packId: string, dto: AddPackMaterialDto) {
    const material = this.materialRepository.create({
      packId,
      fileName: dto.fileName,
      fileType: dto.fileType,
      fileSize: String(dto.fileSize ?? 0),
      storageUrl: dto.storageUrl,
      rawText: dto.rawText,
    });

    return this.materialRepository.save(material);
  }

  async mockParse(packId: string) {
    await this.packRepository.update(packId, { status: PackStatus.ACTIVE });

    const existingChapters = await this.chapterRepository.count({ where: { packId } });
    if (existingChapters === 0) {
      await this.chapterRepository.save([
        this.chapterRepository.create({
          packId,
          title: '第一章 基础概念',
          chapterOrder: 1,
          level: 1,
          summary: 'AI 从资料中识别出的基础章节示例。',
          masteryRate: 20,
        }),
        this.chapterRepository.create({
          packId,
          title: '第二章 重点训练',
          chapterOrder: 2,
          level: 1,
          summary: '可用于章节练习与错题回顾。',
          masteryRate: 0,
        }),
      ]);
    }

    const existingPoints = await this.pointRepository.count({ where: { packId } });
    if (existingPoints === 0) {
      await this.pointRepository.save([
        this.pointRepository.create({
          packId,
          title: '核心概念',
          description: '基础定义与关键术语。',
          tags: '基础,定义',
        }),
        this.pointRepository.create({
          packId,
          title: '高频易错点',
          description: '适合后续出题和错题回顾。',
          tags: '易错,训练',
        }),
      ]);
    }

    return this.findDetail(packId);
  }
}
