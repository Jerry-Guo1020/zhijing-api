import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLearningPackDto } from './dto/create-learning-pack.dto';
import { AddPackMaterialDto } from './dto/add-pack-material.dto';
import { LearningPackEntity } from './entities/learning-pack.entity';
import { PackMaterialEntity } from './entities/pack-material.entity';
import { PackChapterEntity } from './entities/pack-chapter.entity';
import { PackKnowledgePointEntity } from './entities/pack-knowledge-point.entity';
import { MaterialParseStatus, PackStatus } from '../../common/enums/app.enums';
import { AiSettingsService } from '../ai-settings/ai-settings.service';

type ParsedKnowledgePoint = {
  title?: string;
  description?: string;
  tags?: string[] | string;
};

type ParsedChapter = {
  title?: string;
  summary?: string;
  sourceExcerpt?: string;
  knowledgePoints?: ParsedKnowledgePoint[];
};

type ParsedPackPayload = {
  chapters?: ParsedChapter[];
  knowledgePoints?: ParsedKnowledgePoint[];
};

const LEARNING_PACK_PARSE_SYSTEM_PROMPT = [
  '你是知径学习平台的学习包解析引擎。',
  '你的任务是只根据用户上传的材料生成结构化学习包内容，不能编造材料中不存在的章节、知识点或掌握度。',
  '请返回严格 JSON，不要 Markdown，不要解释。',
  'JSON 格式：{"chapters":[{"title":"章节名","summary":"100字内摘要","sourceExcerpt":"材料原文短片段","knowledgePoints":[{"title":"知识点","description":"说明","tags":["标签"]}]}],"knowledgePoints":[{"title":"跨章节知识点","description":"说明","tags":["标签"]}]}',
  '如果材料不足以拆分章节，也要基于材料生成 1 个真实章节；如果完全无法解析，返回 {"chapters":[],"knowledgePoints":[]}.',
].join('\n');

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
    private readonly aiSettingsService: AiSettingsService,
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

  async findDetail(userId: string, id: string) {
    const pack = await this.findOwnedPack(userId, id);
    const materials = await this.materialRepository.find({
      where: { packId: id },
    });
    const chapters = await this.chapterRepository.find({
      where: { packId: id },
      order: { chapterOrder: 'ASC', createdAt: 'ASC' },
    });
    const knowledgePoints = await this.pointRepository.find({
      where: { packId: id },
    });

    return { pack, materials, chapters, knowledgePoints };
  }

  async addMaterial(userId: string, packId: string, dto: AddPackMaterialDto) {
    await this.findOwnedPack(userId, packId);

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

  async parseWithAi(userId: string, packId: string) {
    const pack = await this.findOwnedPack(userId, packId);
    const materials = await this.materialRepository.find({ where: { packId } });
    const rawText = materials
      .map((material) => material.rawText?.trim())
      .filter(Boolean)
      .join('\n\n---\n\n');

    if (!materials.length || !rawText) {
      throw new BadRequestException(
        '请先上传可解析的文本资料，再生成学习包内容',
      );
    }

    await this.packRepository.update(pack.id, { status: PackStatus.PARSING });
    await this.materialRepository.update(
      { packId },
      { parseStatus: MaterialParseStatus.PROCESSING, parseErrorMessage: null },
    );

    try {
      const parsed = await this.callAiParser(userId, pack, rawText);
      const chapters = this.normalizeChapters(parsed);

      if (chapters.length === 0) {
        throw new BadRequestException(
          'AI 未能从资料中解析出有效章节，请补充更完整的材料',
        );
      }

      await this.chapterRepository.delete({ packId });
      await this.pointRepository.delete({ packId });

      const savedChapters: PackChapterEntity[] = [];
      for (const [index, chapter] of chapters.entries()) {
        const saved = await this.chapterRepository.save(
          this.chapterRepository.create({
            packId,
            title: chapter.title!.slice(0, 150),
            chapterOrder: index + 1,
            level: 1,
            summary: chapter.summary?.slice(0, 1000) ?? null,
            sourceExcerpt: chapter.sourceExcerpt?.slice(0, 2000) ?? null,
            masteryRate: 0,
          }),
        );
        savedChapters.push(saved);

        const points = this.normalizeKnowledgePoints(chapter.knowledgePoints);
        if (points.length) {
          await this.pointRepository.save(
            points.map((point) =>
              this.pointRepository.create({
                packId,
                chapterId: saved.id,
                title: point.title!.slice(0, 150),
                description: point.description?.slice(0, 1000) ?? null,
                tags: this.normalizeTags(point.tags),
              }),
            ),
          );
        }
      }

      const topLevelPoints = this.normalizeKnowledgePoints(
        parsed.knowledgePoints,
      );
      if (topLevelPoints.length) {
        await this.pointRepository.save(
          topLevelPoints.map((point) =>
            this.pointRepository.create({
              packId,
              title: point.title!.slice(0, 150),
              description: point.description?.slice(0, 1000) ?? null,
              tags: this.normalizeTags(point.tags),
            }),
          ),
        );
      }

      await this.materialRepository.update(
        { packId },
        { parseStatus: MaterialParseStatus.SUCCESS, parseErrorMessage: null },
      );
      await this.packRepository.update(packId, { status: PackStatus.ACTIVE });

      return this.findDetail(userId, packId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI 解析失败';
      await this.packRepository.update(packId, { status: PackStatus.FAILED });
      await this.materialRepository.update(
        { packId },
        {
          parseStatus: MaterialParseStatus.FAILED,
          parseErrorMessage: message.slice(0, 255),
        },
      );
      throw error;
    }
  }

  private async findOwnedPack(userId: string, id: string) {
    const pack = await this.packRepository.findOne({ where: { id, userId } });
    if (!pack) {
      throw new NotFoundException('学习包不存在');
    }
    return pack;
  }

  private async callAiParser(
    userId: string,
    pack: LearningPackEntity,
    rawText: string,
  ): Promise<ParsedPackPayload> {
    const config = await this.aiSettingsService.getRuntimeConfig(userId);
    const model = config.modelName || 'gpt-4o-mini';
    const response = await this.requestChatCompletions(config.baseUrl, {
      apiKey: config.apiKey,
      body: {
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: LEARNING_PACK_PARSE_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              `学习包名称：${pack.title}`,
              `科目：${pack.subjectName ?? '未指定'}`,
              `学习目标：${pack.studyGoal ?? '未指定'}`,
              '上传材料：',
              rawText.slice(0, 16000),
            ].join('\n'),
          },
        ],
      },
    });

    if (!response.ok) {
      throw new BadRequestException(
        `AI 解析调用失败，服务返回 HTTP ${response.status}${await this.readErrorDetail(response)}`,
      );
    }

    const payload = (await this.readJson(
      response,
      'AI 解析返回内容不是有效 JSON',
    )) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new BadRequestException('AI 解析没有返回内容');
    }

    return this.parseJsonPayload(content);
  }

  private async requestChatCompletions(
    baseUrl: string,
    options: { apiKey: string; body: Record<string, unknown> },
  ) {
    try {
      return await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options.body),
        signal: AbortSignal.timeout(45000),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '请求失败';
      throw new BadRequestException(`AI 解析连接失败：${message}`);
    }
  }

  private async readJson(response: Response, fallbackMessage: string) {
    try {
      return await response.json();
    } catch {
      throw new BadRequestException(fallbackMessage);
    }
  }

  private async readErrorDetail(response: Response) {
    try {
      const text = await response.text();
      if (!text.trim()) {
        return '';
      }
      return `，${text.trim().slice(0, 180)}`;
    } catch {
      return '';
    }
  }

  private parseJsonPayload(content: string): ParsedPackPayload {
    const cleaned = content
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    try {
      return JSON.parse(cleaned) as ParsedPackPayload;
    } catch {
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start >= 0 && end > start) {
        return JSON.parse(cleaned.slice(start, end + 1)) as ParsedPackPayload;
      }
      throw new BadRequestException('AI 解析结果不是有效 JSON');
    }
  }

  private normalizeChapters(parsed: ParsedPackPayload) {
    return (Array.isArray(parsed.chapters) ? parsed.chapters : []).filter(
      (chapter) => Boolean(chapter.title?.trim()),
    );
  }

  private normalizeKnowledgePoints(points?: ParsedKnowledgePoint[]) {
    return (Array.isArray(points) ? points : []).filter((point) =>
      Boolean(point.title?.trim()),
    );
  }

  private normalizeTags(tags?: string[] | string) {
    if (Array.isArray(tags)) {
      return tags.filter(Boolean).join(',').slice(0, 100) || null;
    }
    return tags?.slice(0, 100) ?? null;
  }
}
