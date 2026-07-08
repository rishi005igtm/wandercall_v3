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

  async findById(idOrSlug: string): Promise<CommunityEntity | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    if (isUuid) {
      return this.repo.findOne({ where: { id: idOrSlug } });
    }
    return this.repo.findOne({ where: { slug: idOrSlug } });
  }

  async findBySlug(slugOrId: string): Promise<CommunityEntity | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    if (isUuid) {
      return this.repo.findOne({ where: { id: slugOrId } });
    }
    return this.repo.findOne({ where: { slug: slugOrId } });
  }

  async resolveId(idOrSlug: string): Promise<string | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    if (isUuid) return idOrSlug;
    const community = await this.repo.findOne({ where: { slug: idOrSlug }, select: ['id'] });
    return community ? community.id : null;
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
      .innerJoin('community_members', 'cm', 'cm."communityId" = c.id AND cm."userId" = :userId AND cm.status = :status', { userId, status: 'ACTIVE' })
      .orderBy('cm."joinedAt"', 'DESC')
      .getMany();
  }
}
