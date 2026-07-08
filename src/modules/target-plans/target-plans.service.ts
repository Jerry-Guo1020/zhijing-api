import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTargetPlanDto } from './dto/create-target-plan.dto';
import { UpdateTargetPlanDto } from './dto/update-target-plan.dto';
import { LearningReportEntity } from './entities/learning-report.entity';
import { TargetPlanEntity } from './entities/target-plan.entity';
import { ReportType } from '../../common/enums/app.enums';

type CollegeLevel = 'undergraduate' | 'graduate';

type CollegeSearchResult = {
  id: string;
  name: string;
  region: string;
  type: string;
  scoreRange: string;
  majors: string[];
  introduction: string;
  admissionSummary: string;
  level: CollegeLevel;
  sourceName: string;
  sourceUrl: string;
};

const MOE_COLLEGE_SOURCE_URL = 'https://hudong.moe.gov.cn/qggxmd/';
const MOE_COLLEGE_DATA_URL =
  'https://hudong.moe.gov.cn/school/wcmdata/getDataIndex.jsp?listid=10000101';

const curatedColleges: CollegeSearchResult[] = [
  {
    id: 'college-pku',
    name: '北京大学',
    region: '北京市',
    type: '本科 / 985 / 211 / 双一流',
    scoreRange: '参考招生简章',
    majors: ['中国语言文学', '计算机科学与技术', '法学', '心理学'],
    introduction: '教育部直属综合性研究型大学，文理医工多学科基础雄厚。',
    admissionSummary: '本科与研究生招生政策以学校招生网和研招网当年公告为准。',
    level: 'undergraduate',
    sourceName: '教育部全国普通高等学校名单',
    sourceUrl: MOE_COLLEGE_SOURCE_URL,
  },
  {
    id: 'college-tsinghua',
    name: '清华大学',
    region: '北京市',
    type: '本科 / 985 / 211 / 双一流',
    scoreRange: '参考招生简章',
    majors: ['计算机科学与技术', '电子信息', '建筑学', '管理科学与工程'],
    introduction: '教育部直属综合性研究型大学，工科、理科与交叉学科优势突出。',
    admissionSummary: '研究生方向建议结合学院招生目录、复试线和导师方向制定目标。',
    level: 'undergraduate',
    sourceName: '教育部全国普通高等学校名单',
    sourceUrl: MOE_COLLEGE_SOURCE_URL,
  },
  {
    id: 'college-nju',
    name: '南京大学',
    region: '江苏省',
    type: '本科 / 985 / 211 / 双一流',
    scoreRange: '参考招生简章',
    majors: ['计算机科学与技术', '软件工程', '中国语言文学', '教育技术学'],
    introduction: '综合实力强，基础学科和交叉学科资源丰富，适合长期复盘规划。',
    admissionSummary: '研究生复试通常更关注专业基础、科研潜力与英语材料阅读能力。',
    level: 'undergraduate',
    sourceName: '教育部全国普通高等学校名单',
    sourceUrl: MOE_COLLEGE_SOURCE_URL,
  },
  {
    id: 'college-suda',
    name: '苏州大学',
    region: '江苏省',
    type: '本科 / 211 / 双一流',
    scoreRange: '参考招生简章',
    majors: ['教育学', '应用心理', '软件工程', '设计学'],
    introduction: '学科覆盖完整，城市资源充足，适合兼顾专业学习与实践机会。',
    admissionSummary: '专业课考察相对稳定，建议提前建立章节题库与错题复练节奏。',
    level: 'undergraduate',
    sourceName: '教育部全国普通高等学校名单',
    sourceUrl: MOE_COLLEGE_SOURCE_URL,
  },
  {
    id: 'college-zju',
    name: '浙江大学',
    region: '浙江省',
    type: '本科 / 985 / 211 / 双一流',
    scoreRange: '参考招生简章',
    majors: ['人工智能', '控制科学与工程', '教育技术学', '软件工程'],
    introduction: '工科和交叉方向优势明显，对综合能力、项目经历和专业基础要求较高。',
    admissionSummary: '初试竞争强，复试常关注项目表达、专业基础和知识迁移能力。',
    level: 'undergraduate',
    sourceName: '教育部全国普通高等学校名单',
    sourceUrl: MOE_COLLEGE_SOURCE_URL,
  },
];

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

  async searchColleges(keyword = '', level: CollegeLevel = 'undergraduate') {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const officialResults = await this.fetchOfficialCollegeResults(normalizedKeyword, level);
    const merged = this.mergeCollegeResults([...officialResults, ...curatedColleges], level);

    if (!normalizedKeyword) {
      return merged.slice(0, 24);
    }

    return merged.filter((college) => {
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

  private async fetchOfficialCollegeResults(
    keyword: string,
    level: CollegeLevel,
  ): Promise<CollegeSearchResult[]> {
    const pages = keyword ? 12 : 2;
    const results: CollegeSearchResult[] = [];

    try {
      for (let page = 1; page <= pages; page += 1) {
        const response = await fetch(`${MOE_COLLEGE_DATA_URL}&page=${page}`, {
          method: 'POST',
          signal: AbortSignal.timeout(3000),
        });
        if (!response.ok) {
          break;
        }
        const html = await response.text();
        results.push(...this.parseMoeRows(html, level));
      }
    } catch {
      return [];
    }

    return results;
  }

  private parseMoeRows(html: string, level: CollegeLevel): CollegeSearchResult[] {
    const rows = html.match(/<tr[\s\S]*?<\/tr>/g) ?? [];
    return rows
      .map((row) => {
        const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((match) =>
          this.decodeHtml(match[1].replace(/<[^>]+>/g, '').trim()),
        );
        if (cells.length < 6 || cells[5] !== '本科') {
          return null;
        }
        const name = cells[1];
        const region = cells[4];
        const owner = cells[3];
        return this.toCollegeResult(
          {
            id: `moe-${cells[2]}`,
            name,
            region,
            type: `${cells[5]} / ${owner}`,
            majors: ['招生专业以学校当年公布目录为准'],
            introduction: `${name}是教育部全国普通高等学校名单收录高校，所在地为${region}。`,
            admissionSummary:
              level === 'graduate'
                ? '研究生招生请结合中国研究生招生信息网和学校研究生院当年目录核对。'
                : '本科招生请结合学校本科招生网和省级招生考试机构当年政策核对。',
            sourceName: '教育部全国普通高等学校名单',
            sourceUrl: MOE_COLLEGE_SOURCE_URL,
          },
          level,
        );
      })
      .filter((college): college is CollegeSearchResult => Boolean(college));
  }

  private mergeCollegeResults(items: CollegeSearchResult[], level: CollegeLevel) {
    const map = new Map<string, CollegeSearchResult>();
    for (const item of items) {
      const normalized = this.toCollegeResult(item, level);
      map.set(normalized.name, normalized);
    }
    return [...map.values()];
  }

  private toCollegeResult(
    item: Omit<CollegeSearchResult, 'level' | 'scoreRange'> & {
      level?: CollegeLevel;
      scoreRange?: string;
    },
    level: CollegeLevel,
  ): CollegeSearchResult {
    return {
      ...item,
      level,
      scoreRange: item.scoreRange ?? '参考招生简章',
      type:
        level === 'graduate'
          ? `${item.type.replace(/^本科\s*\/\s*/, '')} / 研究生报考`
          : item.type,
      admissionSummary:
        level === 'graduate'
          ? item.admissionSummary.replace('本科招生', '研究生招生')
          : item.admissionSummary,
    };
  }

  private decodeHtml(value: string) {
    return value
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }
}
