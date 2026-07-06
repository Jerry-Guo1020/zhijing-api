import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatePracticeSessionDto } from './dto/create-practice-session.dto';
import {
  SubmitPracticeAnswerDto,
  SubmitPracticeSessionDto,
} from './dto/submit-practice-session.dto';
import { PracticeQuestionEntity } from './entities/practice-question.entity';
import { PracticeSessionEntity } from './entities/practice-session.entity';
import { PracticeAnswerEntity } from './entities/practice-answer.entity';
import {
  PracticeSessionStatus,
  WrongQuestionStatus,
} from '../../common/enums/app.enums';
import { WrongQuestionEntity } from '../wrong-book/entities/wrong-question.entity';
import { StudyStreakEntity } from '../focus/entities/study-streak.entity';

@Injectable()
export class PracticeService {
  constructor(
    @InjectRepository(PracticeQuestionEntity)
    private readonly questionRepository: Repository<PracticeQuestionEntity>,
    @InjectRepository(PracticeSessionEntity)
    private readonly sessionRepository: Repository<PracticeSessionEntity>,
    @InjectRepository(PracticeAnswerEntity)
    private readonly answerRepository: Repository<PracticeAnswerEntity>,
    @InjectRepository(WrongQuestionEntity)
    private readonly wrongQuestionRepository: Repository<WrongQuestionEntity>,
    @InjectRepository(StudyStreakEntity)
    private readonly streakRepository: Repository<StudyStreakEntity>,
  ) {}

  findQuestions(packId: string, chapterId?: string) {
    return this.questionRepository.find({
      where: chapterId ? { packId, chapterId } : { packId },
      order: { createdAt: 'DESC' },
    });
  }

  async createSession(userId: string, dto: CreatePracticeSessionDto) {
    const questions = await this.questionRepository.find({
      where: { id: In(dto.questionIds) },
    });

    if (!questions.length) {
      throw new BadRequestException('未找到可用题目');
    }

    const session = this.sessionRepository.create({
      userId,
      packId: dto.packId,
      chapterId: dto.chapterId,
      sessionType: dto.sessionType,
      status: PracticeSessionStatus.ONGOING,
      questionCount: questions.length,
    });

    return this.sessionRepository.save(session);
  }

  async getSessionDetail(sessionId: string) {
    const session = await this.sessionRepository.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException('练习会话不存在');
    }

    const answers = await this.answerRepository.find({ where: { sessionId } });
    return { session, answers };
  }

  async submitSession(
    userId: string,
    sessionId: string,
    dto: SubmitPracticeSessionDto,
  ) {
    const session = await this.sessionRepository.findOne({ where: { id: sessionId, userId } });
    if (!session) {
      throw new NotFoundException('练习会话不存在');
    }

    const questionIds = dto.answers.map((item) => item.questionId);
    const questions = await this.questionRepository.find({ where: { id: In(questionIds) } });
    const questionMap = new Map(questions.map((item) => [item.id, item]));

    let correctCount = 0;
    let wrongCount = 0;

    const answersToSave = dto.answers.map((item: SubmitPracticeAnswerDto) => {
      const question = questionMap.get(item.questionId);
      const isCorrect = this.compareAnswer(item.userAnswer, question?.correctAnswer ?? '');

      if (isCorrect) {
        correctCount += 1;
      } else {
        wrongCount += 1;
      }

      return this.answerRepository.create({
        sessionId,
        questionId: item.questionId,
        userAnswer: item.userAnswer,
        isCorrect,
        isMarked: item.isMarked ?? false,
        aiExplanation: isCorrect ? '回答正确。' : '回答错误，建议复习相关知识点。',
      });
    });

    await this.answerRepository.save(answersToSave);
    await this.handleWrongQuestions(userId, session, answersToSave, questionMap);
    await this.updateStudyStreak(userId);

    session.correctCount = correctCount;
    session.wrongCount = wrongCount;
    session.durationSeconds = dto.durationSeconds;
    session.accuracyRate = session.questionCount
      ? Number(((correctCount / session.questionCount) * 100).toFixed(2))
      : 0;
    session.status = PracticeSessionStatus.SUBMITTED;
    session.submittedAt = new Date();

    return this.sessionRepository.save(session);
  }

  private compareAnswer(userAnswer: string, correctAnswer: string) {
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = correctAnswer.trim().toLowerCase();
    return normalizedUserAnswer === normalizedCorrectAnswer;
  }

  private async handleWrongQuestions(
    userId: string,
    session: PracticeSessionEntity,
    answers: PracticeAnswerEntity[],
    questionMap: Map<string, PracticeQuestionEntity>,
  ) {
    for (const answer of answers) {
      if (answer.isCorrect) {
        continue;
      }

      const question = questionMap.get(answer.questionId);
      const existing = await this.wrongQuestionRepository.findOne({
        where: {
          userId,
          questionId: answer.questionId,
        },
      });

      if (existing) {
        existing.lastSessionId = session.id;
        existing.lastWrongAt = new Date();
        existing.reviewCount += 1;
        existing.status = WrongQuestionStatus.PENDING_REVIEW;
        await this.wrongQuestionRepository.save(existing);
      } else {
        const wrongQuestion = this.wrongQuestionRepository.create({
          userId,
          packId: session.packId,
          chapterId: session.chapterId,
          questionId: answer.questionId,
          lastSessionId: session.id,
          wrongReason: '答题错误',
          aiReview: question?.explanation ?? null,
          reviewCount: 0,
          status: WrongQuestionStatus.PENDING_REVIEW,
          lastWrongAt: new Date(),
        });
        await this.wrongQuestionRepository.save(wrongQuestion);
      }
    }
  }

  private async updateStudyStreak(userId: string) {
    const today = new Date();
    const todayString = today.toISOString().slice(0, 10);
    const streak = await this.streakRepository.findOne({ where: { userId } });

    if (!streak) {
      await this.streakRepository.save(
        this.streakRepository.create({
          userId,
          currentStreakDays: 1,
          longestStreakDays: 1,
          totalStudyDays: 1,
          lastStudyDate: todayString,
        }),
      );
      return;
    }

    if (streak.lastStudyDate === todayString) {
      return;
    }

    const previousDate = streak.lastStudyDate ? new Date(streak.lastStudyDate) : null;
    const diffDays = previousDate
      ? Math.floor((today.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    streak.currentStreakDays = diffDays === 1 ? streak.currentStreakDays + 1 : 1;
    streak.longestStreakDays = Math.max(streak.longestStreakDays, streak.currentStreakDays);
    streak.totalStudyDays += 1;
    streak.lastStudyDate = todayString;

    await this.streakRepository.save(streak);
  }
}
