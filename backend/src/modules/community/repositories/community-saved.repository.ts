import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunitySavedEntity } from '../entities/community-saved.entity';

@Injectable()
export class CommunitySavedRepository {
  constructor(
    @InjectRepository(CommunitySavedEntity)
    private readonly repo: Repository<CommunitySavedEntity>,
  ) {}

  async create(
    data: Partial<CommunitySavedEntity>,
  ): Promise<CommunitySavedEntity> {
    const saved = this.repo.create(data);
    return this.repo.save(saved);
  }

  async findByUserAndCommunity(
    userId: string,
    communityId: string,
  ): Promise<CommunitySavedEntity | null> {
    return this.repo.findOne({ where: { userId, communityId } });
  }

  async remove(userId: string, communityId: string): Promise<void> {
    await this.repo.softDelete({ userId, communityId });
  }
}
