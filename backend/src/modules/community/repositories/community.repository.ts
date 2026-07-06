import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityEntity } from '../entities/community.entity';

@Injectable()
export class CommunityRepository {
  constructor(
    @InjectRepository(CommunityEntity)
    private readonly repo: Repository<CommunityEntity>,
  ) {}

  async create(data: Partial<CommunityEntity>): Promise<CommunityEntity> {
    const community = this.repo.create(data);
    return this.repo.save(community);
  }

  async findById(id: string): Promise<CommunityEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async findBySlug(slug: string): Promise<CommunityEntity | null> {
    return this.repo.findOne({ where: { slug } });
  }

  async update(id: string, data: Partial<CommunityEntity>): Promise<void> {
    await this.repo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async incrementMemberCount(id: string): Promise<void> {
    await this.repo.increment({ id }, 'currentMemberCount', 1);
  }

  async decrementMemberCount(id: string): Promise<void> {
    await this.repo.decrement({ id }, 'currentMemberCount', 1);
  }

  async findJoinedByUser(userId: string): Promise<CommunityEntity[]> {
    return this.repo.createQueryBuilder('c')
      .innerJoin('community_members', 'cm', 'cm."communityId" = c.id AND cm."userId" = :userId', { userId })
      .orderBy('cm."joinedAt"', 'DESC')
      .getMany();
  }
}
