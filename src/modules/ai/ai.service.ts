import { Injectable } from '@nestjs/common';
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
    private readonly aiSettingsService: AiSettingsService,
  ) {}

  async ask(userId: string, dto: AskQuestionDto) {
    await this.aiSettingsService.getRuntimeConfig(userId);

    const answer = `这是基于学习包 ${dto.packId} 的示例回答：${dto.question}。后续可接入真实大模型与 RAG 检索。`;

    const record = this.qaRepository.create({
      userId,
      packId: dto.packId,
      chapterId: dto.chapterId,
      question: dto.question,
      answer,
      sourceReferences: JSON.stringify([
        {
          fileName: 'demo-material.pdf',
          chapterTitle: '第一章 基础概念',
          excerpt: '这里是资料来源片段示例。',
        },
      ]),
    });

    return this.qaRepository.save(record);
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

  async generateFlashcards(userId: string, packId: string, dto: GenerateFlashcardsDto) {
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

    wrongQuestion.aiReview = '错因分析：基础概念理解不牢，建议先复习章节摘要，再进行相似题训练。';
    wrongQuestion.wrongReason = wrongQuestion.wrongReason ?? '概念混淆';

    return this.wrongQuestionRepository.save(wrongQuestion);
  }
}
