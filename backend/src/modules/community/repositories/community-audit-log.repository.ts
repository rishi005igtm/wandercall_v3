import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CommunityAuditLogEntity } from '../entities/community-audit-log.entity';

@Injectable()
export class CommunityAuditLogRepository extends Repository<CommunityAuditLogEntity> {
  constructor(private readonly dataSource: DataSource) {
    super(CommunityAuditLogEntity, dataSource.createEntityManager());
  }

  async createLog(
    data: Partial<CommunityAuditLogEntity>,
  ): Promise<CommunityAuditLogEntity> {
    const log = this.create(data);
    return this.save(log);
  }

  async findLogs(
    communityId: string,
    filter: {
      actorId?: string;
      targetUserId?: string;
      action?: string;
      limit?: number;
      cursor?: string;
    } = {},
  ): Promise<{ items: CommunityAuditLogEntity[]; nextCursor?: string }> {
    const limit = Math.min(filter.limit || 30, 100);
    const query = this.createQueryBuilder('log').where(
      'log.communityId = :communityId',
      { communityId },
    );

    if (filter.actorId) {
      query.andWhere('log.actorId = :actorId', { actorId: filter.actorId });
    }
    if (filter.targetUserId) {
      query.andWhere('log.targetUserId = :targetUserId', {
        targetUserId: filter.targetUserId,
      });
    }
    if (filter.action) {
      query.andWhere('log.action = :action', { action: filter.action });
    }
    if (filter.cursor) {
      query.andWhere('log.createdAt < :cursor', {
        cursor: new Date(filter.cursor),
      });
    }

    query.orderBy('log.createdAt', 'DESC').take(limit + 1);

    const items = await query.getMany();
    let nextCursor: string | undefined = undefined;

    if (items.length > limit) {
      const popped = items.pop();
      nextCursor = popped?.createdAt.toISOString();
    }

    return { items, nextCursor };
  }
}
