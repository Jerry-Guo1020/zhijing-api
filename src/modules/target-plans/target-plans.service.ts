import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTargetPlanDto } from './dto/create-target-plan.dto';
import { UpdateTargetPlanDto } from './dto/update-target-plan.dto';
import { LearningReportEntity } from './entities/learning-report.entity';
import { TargetPlanEntity } from './entities/target-plan.entity';
import { ReportType } from '../../common/enums/app.enums';

@Injectable()
export class TargetPlansService {
  constructor(
    @InjectRepository(TargetPlanEntity)
    private readonly targetPlanRepository: Repository<TargetPlanEntity>,
    @InjectRepository(LearningReportEntity)
    private readonly reportRepository: Repository<LearningReportEntity>,
  ) {}

  findPlans(userId: string) {
    return this.targetPlanRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  searchColleges(keyword = '') {
    const colleges = [
      {
        id: 'college-nju',
        name: '南京大学',
        region: '江苏 南京',
        type: '985 / 双一流',
        scoreRange: '370-395',
        majors: ['计算机科学与技术', '软件工程', '中国语言文学'],
        introduction: '综合实力强，基础学科和交叉学科资源丰富，适合目标明确、需要长期复盘规划的学生。',
        admissionSummary: '近年复试更看重基础能力、科研潜力与英语材料阅读能力。',
      },
      {
        id: 'college-suda',
        name: '苏州大学',
        region: '江苏 苏州',
        type: '211 / 双一流',
        scoreRange: '345-375',
        majors: ['教育学', '应用心理', '软件工程'],
        introduction: '学科覆盖完整，城市资源充足，适合希望兼顾专业学习与实践机会的学生。',
        admissionSummary: '专业课考察稳定，建议提前建立章节题库与错题复练节奏。',
      },
      {
        id: 'college-zju',
        name: '浙江大学',
        region: '浙江 杭州',
        type: '985 / 双一流',
        scoreRange: '380-410',
        majors: ['人工智能', '控制科学与工程', '教育技术学'],
        introduction: '工科和交叉方向优势明显，对综合能力、项目经历和专业基础要求较高。',
        admissionSummary: '初试分数竞争强，复试常关注项目表达和知识迁移能力。',
      },
    ];

    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) {
      return colleges;
    }

    return colleges.filter((college) => {
      const searchable = `${college.name}${college.region}${college.type}${college.majors.join('')}`.toLowerCase();
      return searchable.includes(normalizedKeyword);
    });
  }

  createPlan(userId: string, dto: CreateTargetPlanDto) {
    const plan = this.targetPlanRepository.create({
      userId,
      collegeName: dto.collegeName,
      majorName: dto.majorName,
      targetYear: dto.targetYear,
      targetScore: dto.targetScore,
      countdownDays: dto.countdownDays,
      notes: dto.notes,
    });

    return this.targetPlanRepository.save(plan);
  }

  async updatePlan(userId: string, id: string, dto: UpdateTargetPlanDto) {
    const plan = await this.targetPlanRepository.findOne({ where: { id, userId } });
    if (!plan) {
      return null;
    }

    Object.assign(plan, dto);
    return this.targetPlanRepository.save(plan);
  }

  findReports(userId: string) {
    return this.reportRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  generateWeeklyReport(userId: string) {
    const today = new Date();
    const periodEnd = today.toISOString().slice(0, 10);
    const periodStartDate = new Date(today);
    periodStartDate.setDate(today.getDate() - 6);
    const periodStart = periodStartDate.toISOString().slice(0, 10);

    const report = this.reportRepository.create({
      userId,
      type: ReportType.WEEKLY,
      periodStart,
      periodEnd,
      aiSummary:
        '本周学习投入较稳定，建议优先复习高频错题和待复习卡片，并延续专注学习节奏。',
      reportPayload: JSON.stringify({
        studyMinutes: 320,
        questionCount: 68,
        accuracyRate: 76.5,
        flashcardReviews: 42,
      }),
    });

    return this.reportRepository.save(report);
  }
}
