import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AskQuestionDto } from './dto/ask-question.dto';
import { GenerateQuestionsDto } from './dto/generate-questions.dto';
import { GenerateFlashcardsDto } from './dto/generate-flashcards.dto';
import { ReviewWrongQuestionDto } from './dto/review-wrong-question.dto';
import { QaRecordEntity } from './entities/qa-record.entity';
import { PracticeQuestionEntity } from '../practice/entities/practice-question.entity';
import { FlashcardEntity } from '../flashcards/entities/flashcard.entity';
import {
  FlashcardType,
  QuestionDifficulty,
  QuestionType,
} from '../../common/enums/app.enums';
import { WrongQuestionEntity } from '../wrong-book/entities/wrong-question.entity';
import { AiSettingsService } from '../ai-settings/ai-settings.service';
import { LearningPackEntity } from '../learning-packs/entities/learning-pack.entity';
import { PackMaterialEntity } from '../learning-packs/entities/pack-material.entity';
import { PackChapterEntity } from '../learning-packs/entities/pack-chapter.entity';

const AI_QA_SYSTEM_PROMPT = [
  '你是知径学习平台的 AI 学习助手。',
  '请优先依据用户学习包中的资料片段回答；资料不足时要明确说明，不要编造来源。',
  '回答应结合学习建议，语言清晰，适合学生复习使用。',
].join('\n');

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(QaRecordEntity)
    private readonly qaRepository: Repository<QaRecordEntity>,
    @InjectRepository(PracticeQuestionEntity)
    private readonly questionRepository: Repository<PracticeQuestionEntity>,
    @InjectRepository(FlashcardEntity)
    private readonly flashcardRepository: Repository<FlashcardEntity>,
    @InjectRepository(WrongQuestionEntity)
    private readonly wrongQuestionRepository: Repository<WrongQuestionEntity>,
    @InjectRepository(LearningPackEntity)
    private readonly packRepository: Repository<LearningPackEntity>,
    @InjectRepository(PackMaterialEntity)
    private readonly materialRepository: Repository<PackMaterialEntity>,
    @InjectRepository(PackChapterEntity)
    private readonly chapterRepository: Repository<PackChapterEntity>,
    private readonly aiSettingsService: AiSettingsService,
  ) {}

  async ask(userId: string, dto: AskQuestionDto) {
    const pack = await this.packRepository.findOne({
      where: { id: dto.packId, userId },
    });
    if (!pack) {
      throw new NotFoundException('学习包不存在');
    }

    const [materials, chapters] = await Promise.all([
      this.materialRepository.find({ where: { packId: dto.packId } }),
      this.chapterRepository.find({
        where: { packId: dto.packId },
        order: { chapterOrder: 'ASC' },
      }),
    ]);
    const context = [
      `学习包：${pack.title}`,
      `科目：${pack.subjectName ?? '未指定'}`,
      `目标：${pack.studyGoal ?? '未指定'}`,
      `章节：${chapters.map((chapter) => chapter.title).join('；') || '暂无章节'}`,
      '资料片段：',
      materials
        .map((material) => `${material.fileName}\n${material.rawText ?? ''}`)
        .join('\n\n---\n\n')
        .slice(0, 12000),
    ].join('\n');

    if (!materials.some((material) => material.rawText?.trim())) {
      throw new BadRequestException(
        '当前学习包还没有可用于问答的资料，请先上传并解析材料',
      );
    }

    const answer = await this.callAi(userId, context, dto.question);

    const record = this.qaRepository.create({
      userId,
      packId: dto.packId,
      chapterId: dto.chapterId,
      question: dto.question,
      answer,
      sourceReferences: JSON.stringify([
        {
          fileName: materials[0]?.fileName ?? '学习包资料',
          chapterTitle: chapters[0]?.title ?? null,
          excerpt: materials[0]?.rawText?.slice(0, 180) ?? '',
        },
      ]),
    });

    return this.qaRepository.save(record);
  }

  private async callAi(userId: string, context: string, question: string) {
    const config = await this.aiSettingsService.getRuntimeConfig(userId);
    const response = await this.requestChatCompletions(config.baseUrl, {
      apiKey: config.apiKey,
      body: {
        model: config.modelName || 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: AI_QA_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `上下文：\n${context}\n\n问题：${question}`,
          },
        ],
      },
    });

    if (!response.ok) {
      throw new BadRequestException(
        `AI 问答调用失败，服务返回 HTTP ${response.status}${await this.readErrorDetail(response)}`,
      );
    }

    const payload = (await this.readJson(
      response,
      'AI 问答返回内容不是有效 JSON',
    )) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new BadRequestException('AI 问答没有返回内容');
    }
    return content;
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
      throw new BadRequestException(`AI 问答连接失败：${message}`);
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

  async generateQuestions(userId: string, dto: GenerateQuestionsDto) {
    await this.aiSettingsService.getRuntimeConfig(userId);

    const count = dto.count ?? 10;
    const questionType = dto.questionType ?? QuestionType.SINGLE_CHOICE;
    const difficulty = dto.difficulty ?? QuestionDifficulty.MEDIUM;

    const questions = Array.from({ length: count }).map((_, index) =>
      this.questionRepository.create({
        packId: dto.packId,
        chapterId: dto.chapterId,
        questionType,
        difficulty,
        stem: `示例题目 ${index + 1}：请根据章节内容回答该问题。`,
        options:
          questionType === QuestionType.SINGLE_CHOICE ||
          questionType === QuestionType.MULTIPLE_CHOICE
            ? JSON.stringify(['选项 A', '选项 B', '选项 C', '选项 D'])
            : null,
        correctAnswer: questionType === QuestionType.JUDGE ? 'true' : '选项 A',
        explanation: '这里是 AI 自动生成的解析示例。',
        sourceExcerpt: '这里是题目来源片段示例。',
        knowledgePointTags: '核心概念,重点训练',
      }),
    );

    return this.questionRepository.save(questions);
  }

  async generateFlashcards(
    userId: string,
    packId: string,
    dto: GenerateFlashcardsDto,
  ) {
    await this.aiSettingsService.getRuntimeConfig(userId);

    const count = dto.count ?? 10;
    const type = dto.type ?? FlashcardType.CONCEPT;

    const flashcards = Array.from({ length: count }).map((_, index) =>
      this.flashcardRepository.create({
        userId,
        packId,
        chapterId: dto.chapterId,
        type,
        frontText: `卡片正面 ${index + 1}`,
        backText: `卡片反面 ${index + 1}：这里是 AI 提炼的知识点解释。`,
        sourceExcerpt: '这里是知识点来源片段。',
      }),
    );

    return this.flashcardRepository.save(flashcards);
  }

  async reviewWrongQuestion(userId: string, dto: ReviewWrongQuestionDto) {
    await this.aiSettingsService.getRuntimeConfig(userId);

    const wrongQuestion = await this.wrongQuestionRepository.findOne({
      where: { id: dto.wrongQuestionId, userId },
    });

    if (!wrongQuestion) {
      return null;
    }

    wrongQuestion.aiReview =
      '错因分析：基础概念理解不牢，建议先复习章节摘要，再进行相似题训练。';
    wrongQuestion.wrongReason = wrongQuestion.wrongReason ?? '概念混淆';

    return this.wrongQuestionRepository.save(wrongQuestion);
  }
}
