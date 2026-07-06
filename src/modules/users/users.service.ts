import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserPreferenceEntity } from './entities/user-preference.entity';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserPreferenceEntity)
    private readonly preferenceRepository: Repository<UserPreferenceEntity>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const preference = await this.preferenceRepository.findOne({ where: { userId } });

    return { user, preference };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.userRepository.update(userId, dto);
    return this.getProfile(userId);
  }

  async updatePreference(userId: string, dto: UpdatePreferenceDto) {
    const preference = await this.preferenceRepository.findOne({ where: { userId } });

    if (!preference) {
      const created = this.preferenceRepository.create({ userId, ...dto });
      await this.preferenceRepository.save(created);
    } else {
      await this.preferenceRepository.update(preference.id, dto);
    }

    return this.getProfile(userId);
  }
}
