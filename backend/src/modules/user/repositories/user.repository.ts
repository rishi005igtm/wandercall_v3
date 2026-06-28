import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileEntity } from '../entities/user-profile.entity';
import { UserSettingsEntity } from '../entities/user-settings.entity';
import { UserPlanEntity } from '../entities/user-plan.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly profileRepo: Repository<UserProfileEntity>,
    @InjectRepository(UserSettingsEntity)
    private readonly settingsRepo: Repository<UserSettingsEntity>,
    @InjectRepository(UserPlanEntity)
    private readonly planRepo: Repository<UserPlanEntity>,
  ) {}

  async findByUserId(userId: string): Promise<UserProfileEntity | null> {
    return this.profileRepo.findOne({ where: { userId } });
  }

  async findByUsername(username: string): Promise<UserProfileEntity | null> {
    return this.profileRepo.findOne({ where: { username: username.toLowerCase() } });
  }

  async saveProfile(profile: UserProfileEntity): Promise<UserProfileEntity> {
    profile.username = profile.username.toLowerCase();
    return this.profileRepo.save(profile);
  }

  async findSettingsByUserId(userId: string): Promise<UserSettingsEntity | null> {
    return this.settingsRepo.findOne({ where: { userId } });
  }

  async saveSettings(settings: UserSettingsEntity): Promise<UserSettingsEntity> {
    return this.settingsRepo.save(settings);
  }

  async findPlanByUserId(userId: string): Promise<UserPlanEntity | null> {
    return this.planRepo.findOne({ where: { userId } });
  }

  async savePlan(plan: UserPlanEntity): Promise<UserPlanEntity> {
    return this.planRepo.save(plan);
  }
}
