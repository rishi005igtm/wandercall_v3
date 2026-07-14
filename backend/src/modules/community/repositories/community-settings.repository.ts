import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunitySettingsEntity } from '../entities/community-settings.entity';

@Injectable()
export class CommunitySettingsRepository {
  constructor(
    @InjectRepository(CommunitySettingsEntity)
    private readonly repo: Repository<CommunitySettingsEntity>,
  ) {}

  async create(
    data: Partial<CommunitySettingsEntity>,
  ): Promise<CommunitySettingsEntity> {
    const settings = this.repo.create(data);
    return this.repo.save(settings);
  }

  async findByCommunityId(
    communityId: string,
  ): Promise<CommunitySettingsEntity | null> {
    return this.repo.findOne({ where: { communityId } });
  }

  async update(
    communityId: string,
    data: Partial<CommunitySettingsEntity>,
  ): Promise<void> {
    await this.repo.update(communityId, data);
  }
}
