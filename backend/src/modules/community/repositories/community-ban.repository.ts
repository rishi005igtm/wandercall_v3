import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityBanEntity } from '../entities/community-ban.entity';

@Injectable()
export class CommunityBanRepository {
  constructor(
    @InjectRepository(CommunityBanEntity)
    private readonly repo: Repository<CommunityBanEntity>,
  ) {}

  async create(data: Partial<CommunityBanEntity>): Promise<CommunityBanEntity> {
    const ban = this.repo.create(data);
    return this.repo.save(ban);
  }

  async findActiveBan(communityId: string, userId: string): Promise<CommunityBanEntity | null> {
    return this.repo.createQueryBuilder('ban')
      .where('ban.communityId = :communityId', { communityId })
      .andWhere('ban.userId = :userId', { userId })
      .andWhere('(ban.permanent = true OR ban.expiresAt > NOW())')
      .getOne();
  }

  async removeBan(communityId: string, userId: string): Promise<void> {
    await this.repo.delete({ communityId, userId });
  }
}
