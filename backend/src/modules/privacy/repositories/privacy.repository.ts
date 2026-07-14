import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PrivacyRelationEntity } from '../entities/privacy-relation.entity';

@Injectable()
export class PrivacyRepository extends Repository<PrivacyRelationEntity> {
  constructor(private dataSource: DataSource) {
    super(PrivacyRelationEntity, dataSource.createEntityManager());
  }

  async getRelation(
    userId: string,
    targetUserId: string,
  ): Promise<PrivacyRelationEntity | null> {
    return this.findOne({
      where: { userId, targetUserId },
    });
  }

  async getBlockedUsers(
    userId: string,
    limit: number = 20,
    cursor?: string,
  ): Promise<{ items: PrivacyRelationEntity[]; nextCursor?: string }> {
    const qb = this.createQueryBuilder('privacy')
      .leftJoinAndSelect('privacy.targetUser', 'targetUser')
      .where('privacy.userId = :userId', { userId })
      .andWhere('privacy.isBlocked = :isBlocked', { isBlocked: true })
      .orderBy('privacy.createdAt', 'DESC')
      .take(limit + 1);

    if (cursor) {
      qb.andWhere('privacy.createdAt < :cursor', { cursor: new Date(cursor) });
    }

    const items = await qb.getMany();
    let nextCursor: string | undefined;

    if (items.length > limit) {
      const lastItem = items.pop();
      nextCursor = lastItem?.createdAt.toISOString();
    }

    return { items, nextCursor };
  }

  async upsertRelation(
    userId: string,
    targetUserId: string,
    updates: Partial<PrivacyRelationEntity>,
  ): Promise<PrivacyRelationEntity> {
    const existing = await this.getRelation(userId, targetUserId);

    if (existing) {
      Object.assign(existing, updates);
      return this.save(existing);
    }

    const newRelation = this.create({ userId, targetUserId, ...updates });
    return this.save(newRelation);
  }
}
