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

  async findAllActive(limit = 100): Promise<UserProfileEntity[]> {
    return this.profileRepo.find({
      where: { isPrivate: false },
      order: { reputationScore: 'DESC', xpCurrent: 'DESC' },
      take: limit,
    });
  }

  async searchActiveProfiles(query: string, limit = 100, offset = 0, excludeUserIds: string[] = []): Promise<UserProfileEntity[]> {
    const qb = this.profileRepo.createQueryBuilder('profile')
      .where('profile.isPrivate = :isPrivate', { isPrivate: false });
    
    if (excludeUserIds.length > 0) {
      qb.andWhere('profile.userId NOT IN (:...excludeUserIds)', { excludeUserIds });
    }

    if (query) {
      qb.andWhere('(profile.username ILIKE :query OR profile.displayName ILIKE :query OR profile.bio ILIKE :query)', { query: `%${query}%` });
    }

    return qb.orderBy('profile.reputationScore', 'DESC')
      .addOrderBy('profile.xpCurrent', 'DESC')
      .skip(offset)
      .take(limit)
      .getMany();
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
