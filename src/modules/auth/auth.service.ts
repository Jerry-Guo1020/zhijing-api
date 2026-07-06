import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '../users/entities/user.entity';
import { UserPreferenceEntity } from '../users/entities/user-preference.entity';
import { AiProviderConfigEntity } from '../ai-settings/entities/ai-provider-config.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserPreferenceEntity)
    private readonly preferenceRepository: Repository<UserPreferenceEntity>,
    @InjectRepository(AiProviderConfigEntity)
    private readonly aiConfigRepository: Repository<AiProviderConfigEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      nickname: dto.nickname,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      studyGoal: dto.studyGoal,
    });

    const savedUser = await this.userRepository.save(user);

    const preference = this.preferenceRepository.create({
      userId: savedUser.id,
      replyStyle: savedUser.replyStyle,
    });
    await this.preferenceRepository.save(preference);

    return this.buildAuthPayload(savedUser);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: [{ email: dto.account }, { phone: dto.account }],
    });

    if (!user) {
      throw new UnauthorizedException('账号不存在');
    }

    const matched = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matched) {
      throw new UnauthorizedException('密码错误');
    }

    return this.buildAuthPayload(user);
  }

  private async buildAuthPayload(user: UserEntity) {
    const aiConfig = await this.aiConfigRepository.findOne({
      where: { userId: user.id },
    });
    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone,
      nickname: user.nickname,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: payload,
      needsAiConfig: !aiConfig?.isEnabled,
    };
  }
}
