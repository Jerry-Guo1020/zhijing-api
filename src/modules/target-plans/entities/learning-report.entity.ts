import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../../common/entities/abstract.entity';
import { ReportType } from '../../../common/enums/app.enums';

@Entity({ name: 'learning_reports' })
export class LearningReportEntity extends AbstractEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ReportType,
    default: ReportType.WEEKLY,
  })
  type: ReportType;

  @Column({ name: 'period_start', type: 'date' })
  periodStart: string;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd: string;

  @Column({ name: 'ai_summary', type: 'longtext', nullable: true })
  aiSummary?: string | null;

  @Column({ name: 'report_payload', type: 'longtext', nullable: true })
  reportPayload?: string | null;
}
