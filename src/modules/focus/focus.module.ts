import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FocusController } from './focus.controller';
import { FocusService } from './focus.service';
import { FocusRecordEntity } from './entities/focus-record.entity';
import { StudyStreakEntity } from './entities/study-streak.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FocusRecordEntity, StudyStreakEntity])],
  controllers: [FocusController],
  providers: [FocusService],
  exports: [FocusService],
})
export class FocusModule {}
