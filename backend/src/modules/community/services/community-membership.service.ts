import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommunityEntity } from '../entities/community.entity';
import { CommunityMemberEntity, CommunityMemberStatus } from '../entities/community-member.entity';
import { CommunityStatisticsEntity } from '../entities/community-statistics.entity';
import { CommunityRepository } from '../repositories/community.repository';
import { CommunityMemberRepository } from '../repositories/community-member.repository';
import { CommunityBanRepository } from '../repositories/community-ban.repository';
import { CommunityRoleRepository } from '../repositories/community-role.repository';
import { CommunityEventDispatcher } from '../events/community-event.dispatcher';
import { CommunityPermissionService } from './community-permission.service';
import { CommunityModerationService } from './community-moderation.service';
import { CommunityRoleService } from './community-role.service';
import { CommunityAuditService } from './community-audit.service';
import { CommunityAuditAction } from '../entities/community-audit-log.entity';

@Injectable()
export class CommunityMembershipService {
  private readonly logger = new Logger(CommunityMembershipService.name);

  constructor(
    private readonly communityRepo: CommunityRepository,
    private readonly memberRepo: CommunityMemberRepository,
    private readonly banRepo: CommunityBanRepository,
    private readonly roleRepo: CommunityRoleRepository,
    private readonly eventDispatcher: CommunityEventDispatcher,
    private readonly permissionService: CommunityPermissionService,
    private readonly moderationService: CommunityModerationService,
    private readonly roleService: CommunityRoleService,
    private readonly auditService: CommunityAuditService,
    private readonly dataSource: DataSource,
  ) {}

  private async resolveCommunityId(communityIdOrSlug: string): Promise<string> {
    const id = await this.communityRepo.resolveId(communityIdOrSlug);
    if (!id) throw new NotFoundException('Community not found');
    return id;
  }

  async joinCommunity(communityId: string, userId: string): Promise<CommunityMemberEntity> {
    communityId = await this.resolveCommunityId(communityId);
    return this.dataSource.transaction(async manager => {
      const community = await manager.findOne(CommunityEntity, { where: { id: communityId }, lock: { mode: 'pessimistic_write' } });
      if (!community) {
        throw new NotFoundException('Community not found');
      }

      const existingMember = await manager.findOne(CommunityMemberEntity, { where: { communityId, userId } });
      if (existingMember) {
        if (existingMember.status === CommunityMemberStatus.ACTIVE) {
          throw new ConflictException('User is already an active member');
        } else if (existingMember.status === CommunityMemberStatus.BANNED) {
          throw new ForbiddenException('User is banned from this community');
        }
      }

      const activeBan = await this.banRepo.findActiveBan(communityId, userId);
      if (activeBan) {
        throw new ForbiddenException('User is currently banned from this community');
      }

      if (community.currentMemberCount >= community.memberLimit) {
        throw new BadRequestException('Community has reached its member limit');
      }

      const memberRole = await this.roleRepo.findByName('MEMBER');
      let member: CommunityMemberEntity;

      if (existingMember) {
        existingMember.status = CommunityMemberStatus.ACTIVE;
        existingMember.roleId = memberRole?.id;
        member = await manager.save(existingMember);
      } else {
        member = manager.create(CommunityMemberEntity, {
          communityId,
          userId,
          roleId: memberRole?.id,
          status: CommunityMemberStatus.ACTIVE,
          isOwner: false,
        });
        member = await manager.save(member);
      }

      community.currentMemberCount += 1;
      await manager.save(community);
      await manager.update(CommunityStatisticsEntity, { communityId }, { memberCount: community.currentMemberCount });

      this.eventDispatcher.dispatchJoined(communityId, userId);
      return member;
    });
  }

  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    communityId = await this.resolveCommunityId(communityId);
    return this.dataSource.transaction(async manager => {
      const community = await manager.findOne(CommunityEntity, { where: { id: communityId }, lock: { mode: 'pessimistic_write' } });
      if (!community) {
        throw new NotFoundException('Community not found');
      }

      const member = await manager.findOne(CommunityMemberEntity, { where: { communityId, userId, status: CommunityMemberStatus.ACTIVE } });
      if (!member) {
        throw new BadRequestException('User is not an active member');
      }

      if (member.isOwner || community.ownerId === userId) {
        throw new BadRequestException('Owner cannot leave community. Transfer ownership first.');
      }

      member.status = CommunityMemberStatus.LEFT;
      await manager.save(member);

      community.currentMemberCount = Math.max(0, community.currentMemberCount - 1);
      await manager.save(community);
      await manager.update(CommunityStatisticsEntity, { communityId }, { memberCount: community.currentMemberCount });

      this.eventDispatcher.dispatchLeft(communityId, userId);
    });
  }

  async kickMember(communityId: string, requesterId: string, targetUserId: string, reason?: string): Promise<void> {
    return this.moderationService.kickMember(communityId, requesterId, targetUserId, reason);
  }

  async banMember(communityId: string, requesterId: string, targetUserId: string, reason?: string, permanent: boolean = true, expiresAt?: Date): Promise<void> {
    const durationMinutes = expiresAt ? Math.round((expiresAt.getTime() - Date.now()) / 60000) : undefined;
    return this.moderationService.banMember(communityId, requesterId, targetUserId, reason, permanent, durationMinutes);
  }

  async muteMember(communityId: string, requesterId: string, targetUserId: string, durationMinutes: number, reason?: string): Promise<void> {
    await this.moderationService.muteMember(communityId, requesterId, targetUserId, durationMinutes, reason);
  }

  async transferOwnership(communityId: string, currentOwnerId: string, newOwnerId: string): Promise<void> {
    communityId = await this.resolveCommunityId(communityId);
    if (currentOwnerId === newOwnerId) {
      throw new BadRequestException('Cannot transfer ownership to yourself');
    }

    return this.dataSource.transaction(async manager => {
      const community = await manager.findOne(CommunityEntity, { where: { id: communityId }, lock: { mode: 'pessimistic_write' } });
      if (!community || community.ownerId !== currentOwnerId) {
        throw new ForbiddenException('You are not the owner of this community');
      }

      const oldOwner = await manager.findOne(CommunityMemberEntity, { where: { communityId, userId: currentOwnerId } });
      const newOwner = await manager.findOne(CommunityMemberEntity, { where: { communityId, userId: newOwnerId, status: CommunityMemberStatus.ACTIVE } });

      if (!newOwner) {
        throw new BadRequestException('New owner must be an active member of the community');
      }

      const adminRole = await this.roleRepo.findByName('ADMIN');
      const ownerRole = await this.roleRepo.findByName('OWNER');

      // Update old owner to Admin
      if (oldOwner) {
        oldOwner.isOwner = false;
        oldOwner.roleId = adminRole?.id;
        await manager.save(oldOwner);
      }

      // Update new owner
      newOwner.isOwner = true;
      newOwner.roleId = ownerRole?.id;
      await manager.save(newOwner);

      // Update community entity
      community.ownerId = newOwnerId;
      await manager.save(community);

      this.eventDispatcher.dispatchOwnerTransferred(communityId, currentOwnerId, newOwnerId);
      await this.auditService.logAction({
        communityId,
        actorId: currentOwnerId,
        targetUserId: newOwnerId,
        action: CommunityAuditAction.OWNERSHIP_TRANSFER,
        reason: 'Community ownership transferred to new owner',
        oldRole: 'MEMBER/ADMIN',
        newRole: 'OWNER',
      });
    });
  }

  async updateRole(communityId: string, requesterId: string, targetUserId: string, newRoleId: string): Promise<void> {
    await this.roleService.assignRole(communityId, requesterId, targetUserId, newRoleId);
  }
}
