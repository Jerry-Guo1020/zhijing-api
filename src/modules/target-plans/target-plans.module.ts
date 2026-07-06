import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningReportEntity } from './entities/learning-report.entity';
import { TargetPlanEntity } from './entities/target-plan.entity';
import { TargetPlansController } from './target-plans.controller';
import { TargetPlansService } from './target-plans.service';

@Module({
  imports: [TypeOrmModule.forFeature([TargetPlanEntity, LearningReportEntity])],
  controllers: [TargetPlansController],
  providers: [TargetPlansService],
  exports: [TargetPlansService],
})
export class TargetPlansModule {}
