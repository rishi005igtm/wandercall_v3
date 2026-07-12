import { Injectable, Logger } from '@nestjs/common';
import { CommunityAuditLogRepository } from '../repositories/community-audit-log.repository';
import { CommunityAuditAction, CommunityAuditLogEntity } from '../entities/community-audit-log.entity';
import { UserRepository } from '../../user/repositories/user.repository';

@Injectable()
export class CommunityAuditService {
  private readonly logger = new Logger(CommunityAuditService.name);

  constructor(
    private readonly auditRepo: CommunityAuditLogRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async logAction(params: {
    communityId: string;
    actorId: string;
    targetUserId?: string;
    action: CommunityAuditAction | string;
    reason?: string;
    oldRole?: string;
    newRole?: string;
    durationMinutes?: number;
    metadata?: any;
  }): Promise<CommunityAuditLogEntity> {
    try {
      const log = await this.auditRepo.createLog({
        communityId: params.communityId,
        actorId: params.actorId,
        targetUserId: params.targetUserId,
        action: params.action,
        reason: params.reason,
        oldRole: params.oldRole,
        newRole: params.newRole,
        durationMinutes: params.durationMinutes,
        metadata: params.metadata || {},
      });
      return log;
    } catch (error: any) {
      this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getLogs(
    communityId: string,
    filter: {
      actorId?: string;
      targetUserId?: string;
      action?: string;
      limit?: number;
      cursor?: string;
    } = {},
  ): Promise<{ items: any[]; nextCursor?: string }> {
    const { items, nextCursor } = await this.auditRepo.findLogs(communityId, filter);

    // Collect all unique user IDs to enrich in a batch
    const userIds = new Set<string>();
    items.forEach((item) => {
      if (item.actorId) userIds.add(item.actorId);
      if (item.targetUserId) userIds.add(item.targetUserId);
    });

    const userMap = new Map<string, { username: string; displayName?: string; avatarUrl?: string }>();
    for (const uid of userIds) {
      const profile = await this.userRepo.findByUserId(uid);
      if (profile) {
        userMap.set(uid, {
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
        });
      }
    }

    const enrichedItems = items.map((item) => {
      const actor = userMap.get(item.actorId);
      const target = item.targetUserId ? userMap.get(item.targetUserId) : null;
      return {
        ...item,
        actorName: actor?.displayName || actor?.username || item.actorId.slice(0, 8),
        actorAvatar: actor?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        targetName: target ? target.displayName || target.username : item.targetUserId?.slice(0, 8),
        targetAvatar: target?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      };
    });

    return { items: enrichedItems, nextCursor };
  }
}
