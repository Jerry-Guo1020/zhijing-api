import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { LearningPacksModule } from './modules/learning-packs/learning-packs.module';
import { AiModule } from './modules/ai/ai.module';
import { PracticeModule } from './modules/practice/practice.module';
import { WrongBookModule } from './modules/wrong-book/wrong-book.module';
import { FlashcardsModule } from './modules/flashcards/flashcards.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { FocusModule } from './modules/focus/focus.module';
import { CommunityModule } from './modules/community/community.module';
import { TargetPlansModule } from './modules/target-plans/target-plans.module';
import { ProfileModule } from './modules/profile/profile.module';
import { RankingModule } from './modules/ranking/ranking.module';
import { AiSettingsModule } from './modules/ai-settings/ai-settings.module';
import { PracticeQuestionEntity } from './modules/practice/entities/practice-question.entity';
import { PracticeSessionEntity } from './modules/practice/entities/practice-session.entity';
import { PracticeAnswerEntity } from './modules/practice/entities/practice-answer.entity';
import { UserEntity } from './modules/users/entities/user.entity';
import { UserPreferenceEntity } from './modules/users/entities/user-preference.entity';
import { LearningPackEntity } from './modules/learning-packs/entities/learning-pack.entity';
import { PackMaterialEntity } from './modules/learning-packs/entities/pack-material.entity';
import { PackChapterEntity } from './modules/learning-packs/entities/pack-chapter.entity';
import { PackKnowledgePointEntity } from './modules/learning-packs/entities/pack-knowledge-point.entity';
import { QaRecordEntity } from './modules/ai/entities/qa-record.entity';
import { WrongQuestionEntity } from './modules/wrong-book/entities/wrong-question.entity';
import { FlashcardEntity } from './modules/flashcards/entities/flashcard.entity';
import { FlashcardReviewEntity } from './modules/flashcards/entities/flashcard-review.entity';
import { LearningTaskEntity } from './modules/tasks/entities/learning-task.entity';
import { FocusRecordEntity } from './modules/focus/entities/focus-record.entity';
import { StudyStreakEntity } from './modules/focus/entities/study-streak.entity';
import { CommunityPostEntity } from './modules/community/entities/community-post.entity';
import { CommunityCommentEntity } from './modules/community/entities/community-comment.entity';
import { CommunityLikeEntity } from './modules/community/entities/community-like.entity';
import { TargetPlanEntity } from './modules/target-plans/entities/target-plan.entity';
import { LearningReportEntity } from './modules/target-plans/entities/learning-report.entity';
import { AiProviderConfigEntity } from './modules/ai-settings/entities/ai-provider-config.entity';

const entities = [
  UserEntity,
  UserPreferenceEntity,
  LearningPackEntity,
  PackMaterialEntity,
  PackChapterEntity,
  PackKnowledgePointEntity,
  QaRecordEntity,
  PracticeQuestionEntity,
  PracticeSessionEntity,
  PracticeAnswerEntity,
  WrongQuestionEntity,
  FlashcardEntity,
  FlashcardReviewEntity,
  LearningTaskEntity,
  FocusRecordEntity,
  StudyStreakEntity,
  CommunityPostEntity,
  CommunityCommentEntity,
  CommunityLikeEntity,
  TargetPlanEntity,
  LearningReportEntity,
  AiProviderConfigEntity,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'zhijing-secret-key',
      signOptions: {
        expiresIn: '7d',
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        autoLoadEntities: false,
        entities,
      }),
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    LearningPacksModule,
    AiModule,
    PracticeModule,
    WrongBookModule,
    FlashcardsModule,
    TasksModule,
    FocusModule,
    CommunityModule,
    TargetPlansModule,
    ProfileModule,
    RankingModule,
    AiSettingsModule,
  ],
})
export class AppModule {}
