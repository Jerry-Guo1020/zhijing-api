import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { StringValue } from 'ms';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserEntity } from '../users/entities/user.entity';
import { UserPreferenceEntity } from '../users/entities/user-preference.entity';
import { AiProviderConfigEntity } from '../ai-settings/entities/ai-provider-config.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserPreferenceEntity,
      AiProviderConfigEntity,
    ]),
    JwtModule.register({
      global: false,
      secret: process.env.JWT_SECRET ?? 'zhijing-secret-key',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as StringValue,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
