import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityStatisticsEntity } from '../entities/community-statistics.entity';

@Injectable()
export class CommunityStatisticsRepository {
  constructor(
    @InjectRepository(CommunityStatisticsEntity)
    private readonly repo: Repository<CommunityStatisticsEntity>,
  ) {}

  async create(
    data: Partial<CommunityStatisticsEntity>,
  ): Promise<CommunityStatisticsEntity> {
    const stats = this.repo.create(data);
    return this.repo.save(stats);
  }

  async findByCommunityId(
    communityId: string,
  ): Promise<CommunityStatisticsEntity | null> {
    return this.repo.findOne({ where: { communityId } });
  }

  async incrementMemberCount(communityId: string): Promise<void> {
    await this.repo.increment({ communityId }, 'memberCount', 1);
  }

  async decrementMemberCount(communityId: string): Promise<void> {
    await this.repo.decrement({ communityId }, 'memberCount', 1);
  }
}
