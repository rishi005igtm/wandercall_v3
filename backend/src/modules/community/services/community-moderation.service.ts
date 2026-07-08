import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommunityEntity } from '../entities/community.entity';
import { CommunityMemberEntity, CommunityMemberStatus } from '../entities/community-member.entity';
import { CommunityStatisticsEntity } from '../entities/community-statistics.entity';
import { CommunityRepository } from '../repositories/community.repository';
import { CommunityMemberRepository } from '../repositories/community-member.repository';
import { CommunityBanRepository } from '../repositories/community-ban.repository';
import { CommunityRoleRepository } from '../repositories/community-role.repository';
import { CommunityPermissionService } from './community-permission.service';
import { CommunityAuditService } from './community-audit.service';
import { CommunityAuditAction } from '../entities/community-audit-log.entity';
import { CommunityEventDispatcher } from '../events/community-event.dispatcher';

@Injectable()
export class CommunityModerationService {
  private readonly logger = new Logger(CommunityModerationService.name);

  constructor(
    private readonly communityRepo: CommunityRepository,
    private readonly memberRepo: CommunityMemberRepository,
    private readonly banRepo: CommunityBanRepository,
    private readonly roleRepo: CommunityRoleRepository,
    private readonly permissionService: CommunityPermissionService,
    private readonly auditService: CommunityAuditService,
    private readonly eventDispatcher: CommunityEventDispatcher,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Issue an official warning to a member.
   */
  async warnMember(communityId: string, actorId: string, targetUserId: string, reason?: string): Promise<void> {
    const id = await this.permissionService.resolveCommunityId(communityId);
    const { member: actorMember, role: actorRole } = await this.permissionService.requirePermission(id, actorId, 'member.mute');

    const targetMember = await this.memberRepo.findByUserAndCommunity(targetUserId, id);
    if (!targetMember || targetMember.status !== CommunityMemberStatus.ACTIVE) {
      throw new NotFoundException('Target user is not an active member of this community');
    }

    const targetRole = targetMember.roleId ? await this.roleRepo.findById(targetMember.roleId) : null;
    this.permissionService.enforceHierarchy(actorRole, actorMember.isOwner, targetRole, targetMember.isOwner, 'warn');

    const actionReason = reason || 'Community guideline warning';

    await this.auditService.logAction({
      communityId: id,
      actorId,
      targetUserId,
      action: CommunityAuditAction.MEMBER_WARN,
      reason: actionReason,
      metadata: { targetUsername: targetMember.nickname },
    });

    // Dispatch event so live UI/notification system picks up the warning immediately
    this.eventDispatcher.dispatchMemberWarned(id, targetUserId, actorId, actionReason);
  }

  /**
   * Mute a member for a specific duration in minutes.
   */
  async muteMember(
    communityId: string,
    actorId: string,
    targetUserId: string,
    durationMinutes: number,
    reason?: string,
  ): Promise<CommunityMemberEntity> {
    const id = await this.permissionService.resolveCommunityId(communityId);
    const { member: actorMember, role: actorRole } = await this.permissionService.requirePermission(id, actorId, 'member.mute');

    const targetMember = await this.memberRepo.findByUserAndCommunity(targetUserId, id);
    if (!targetMember || targetMember.status !== CommunityMemberStatus.ACTIVE) {
      throw new NotFoundException('Target user is not an active member of this community');
    }

    const targetRole = targetMember.roleId ? await this.roleRepo.findById(targetMember.roleId) : null;
    this.permissionService.enforceHierarchy(actorRole, actorMember.isOwner, targetRole, targetMember.isOwner, 'mute');

    const mutedUntil = new Date(Date.now() + durationMinutes * 60000);
    targetMember.isMuted = true;
    targetMember.mutedUntil = mutedUntil;
    const updated = await this.memberRepo.save(targetMember);

    await this.auditService.logAction({
      communityId: id,
      actorId,
      targetUserId,
      action: CommunityAuditAction.MEMBER_MUTE,
      reason: reason || `Muted for ${durationMinutes} minutes`,
      durationMinutes,
      metadata: { mutedUntil: mutedUntil.toISOString() },
    });

    this.eventDispatcher.dispatchMemberMuted(id, targetUserId, actorId, mutedUntil);
    return updated;
  }

  /**
   * Unmute a member immediately.
   */
  async unmuteMember(communityId: string, actorId: string, targetUserId: string, reason?: string): Promise<CommunityMemberEntity> {
    const id = await this.permissionService.resolveCommunityId(communityId);
    const { member: actorMember, role: actorRole } = await this.permissionService.requirePermission(id, actorId, 'member.mute');

    const targetMember = await this.memberRepo.findByUserAndCommunity(targetUserId, id);
    if (!targetMember) {
      throw new NotFoundException('Target user not found');
    }

    const targetRole = targetMember.roleId ? await this.roleRepo.findById(targetMember.roleId) : null;
    this.permissionService.enforceHierarchy(actorRole, actorMember.isOwner, targetRole, targetMember.isOwner, 'unmute');

    targetMember.isMuted = false;
    targetMember.mutedUntil = undefined;
    const updated = await this.memberRepo.save(targetMember);

    await this.auditService.logAction({
      communityId: id,
      actorId,
      targetUserId,
      action: CommunityAuditAction.MEMBER_UNMUTE,
      reason: reason || 'Mute lifted by moderator',
    });

    this.eventDispatcher.dispatchMemberUnmuted(id, targetUserId, actorId, reason);
    return updated;
  }

  /**
   * Kick a member from the community. They can re-join anytime if not banned.
   */
  async kickMember(communityId: string, actorId: string, targetUserId: string, reason?: string): Promise<void> {
    const id = await this.permissionService.resolveCommunityId(communityId);
    const { member: actorMember, role: actorRole } = await this.permissionService.requirePermission(id, actorId, 'member.kick');

    return this.dataSource.transaction(async (manager) => {
      const target = await manager.findOne(CommunityMemberEntity, {
        where: { communityId: id, userId: targetUserId, status: CommunityMemberStatus.ACTIVE },
      });
      if (!target) {
        throw new NotFoundException('Target user is not an active member of this community');
      }

      const targetRole = target.roleId ? await this.roleRepo.findById(target.roleId) : null;
      this.permissionService.enforceHierarchy(actorRole, actorMember.isOwner, targetRole, target.isOwner, 'kick');

      const oldRoleName = targetRole?.displayName || targetRole?.name || 'MEMBER';
      target.status = CommunityMemberStatus.KICKED;
      await manager.save(target);

      const community = await manager.findOne(CommunityEntity, { where: { id }, lock: { mode: 'pessimistic_write' } });
      if (community) {
        community.currentMemberCount = Math.max(0, community.currentMemberCount - 1);
        await manager.save(community);
        await manager.update(CommunityStatisticsEntity, { communityId: id }, { memberCount: community.currentMemberCount });
      }

      await this.auditService.logAction({
        communityId: id,
        actorId,
        targetUserId,
        action: CommunityAuditAction.MEMBER_KICK,
        reason: reason || 'Kicked by moderator',
        oldRole: oldRoleName,
      });

      this.eventDispatcher.dispatchMemberKicked(id, targetUserId, actorId);
    });
  }

  /**
   * Ban a member temporarily or permanently.
   */
  async banMember(
    communityId: string,
    actorId: string,
    targetUserId: string,
    reason?: string,
    permanent = true,
    durationMinutes?: number,
  ): Promise<void> {
    const id = await this.permissionService.resolveCommunityId(communityId);
    const { member: actorMember, role: actorRole } = await this.permissionService.requirePermission(id, actorId, 'member.ban');

    return this.dataSource.transaction(async (manager) => {
      const target = await manager.findOne(CommunityMemberEntity, { where: { communityId: id, userId: targetUserId } });
      const targetRole = target?.roleId ? await this.roleRepo.findById(target.roleId) : null;
      this.permissionService.enforceHierarchy(actorRole, actorMember.isOwner, targetRole, target?.isOwner ?? false, 'ban');

      const oldRoleName = targetRole?.displayName || targetRole?.name || (target?.status === CommunityMemberStatus.ACTIVE ? 'MEMBER' : 'NONE');

      if (target && target.status === CommunityMemberStatus.ACTIVE) {
        target.status = CommunityMemberStatus.BANNED;
        await manager.save(target);

        const community = await manager.findOne(CommunityEntity, { where: { id }, lock: { mode: 'pessimistic_write' } });
        if (community) {
          community.currentMemberCount = Math.max(0, community.currentMemberCount - 1);
          await manager.save(community);
          await manager.update(CommunityStatisticsEntity, { communityId: id }, { memberCount: community.currentMemberCount });
        }
      } else if (target) {
        target.status = CommunityMemberStatus.BANNED;
        await manager.save(target);
      } else {
        // Create banned member record if user never joined before
        const newMember = manager.create(CommunityMemberEntity, {
          communityId: id,
          userId: targetUserId,
          status: CommunityMemberStatus.BANNED,
          isOwner: false,
        });
        await manager.save(newMember);
      }

      const expiresAt = !permanent && durationMinutes ? new Date(Date.now() + durationMinutes * 60000) : undefined;
      await this.banRepo.create({
        communityId: id,
        userId: targetUserId,
        bannedBy: actorId,
        reason: reason || 'Banned from community',
        permanent,
        expiresAt,
      });

      await this.auditService.logAction({
        communityId: id,
        actorId,
        targetUserId,
        action: CommunityAuditAction.MEMBER_BAN,
        reason: reason || (permanent ? 'Permanent Ban' : `Temporary Ban (${durationMinutes}m)`),
        oldRole: oldRoleName,
        durationMinutes: permanent ? undefined : durationMinutes,
        metadata: { permanent, expiresAt: expiresAt?.toISOString() },
      });

      this.eventDispatcher.dispatchMemberBanned(id, targetUserId, actorId);
    });
  }

  /**
   * Unban a member so they can re-join the community.
   */
  async unbanMember(communityId: string, actorId: string, targetUserId: string, reason?: string): Promise<void> {
    const id = await this.permissionService.resolveCommunityId(communityId);
    await this.permissionService.requirePermission(id, actorId, 'member.ban');

    return this.dataSource.transaction(async (manager) => {
      const activeBan = await this.banRepo.findActiveBan(id, targetUserId);
      if (activeBan) {
        await manager.delete(this.banRepo.target, { id: activeBan.id });
      }

      const member = await manager.findOne(CommunityMemberEntity, { where: { communityId: id, userId: targetUserId } });
      if (member && member.status === CommunityMemberStatus.BANNED) {
        member.status = CommunityMemberStatus.LEFT; // Reset to left so they can join again cleanly
        await manager.save(member);
      }

      await this.auditService.logAction({
        communityId: id,
        actorId,
        targetUserId,
        action: CommunityAuditAction.MEMBER_UNBAN,
        reason: reason || 'Ban revoked by moderator',
      });

      this.eventDispatcher.dispatchMemberUnbanned(id, targetUserId, actorId, reason);
    });
  }

  /**
   * Get complete moderation & infractions history for a member.
   */
  async getMemberHistory(
    communityId: string,
    targetUserId: string,
  ): Promise<{ auditLogs: any[]; activeBan: any | null; warningsCount: number; mutesCount: number }> {
    const id = await this.permissionService.resolveCommunityId(communityId);
    const { items: auditLogs } = await this.auditService.getLogs(id, { targetUserId, limit: 50 });
    const activeBan = await this.banRepo.findActiveBan(id, targetUserId);

    let warningsCount = 0;
    let mutesCount = 0;
    for (const log of auditLogs) {
      if (log.action === CommunityAuditAction.MEMBER_WARN) warningsCount++;
      if (log.action === CommunityAuditAction.MEMBER_MUTE) mutesCount++;
    }

    return { auditLogs, activeBan, warningsCount, mutesCount };
  }
}
