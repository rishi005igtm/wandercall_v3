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

@Injectable()
export class CommunityMembershipService {
  private readonly logger = new Logger(CommunityMembershipService.name);

  constructor(
    private readonly communityRepo: CommunityRepository,
    private readonly memberRepo: CommunityMemberRepository,
    private readonly banRepo: CommunityBanRepository,
    private readonly roleRepo: CommunityRoleRepository,
    private readonly eventDispatcher: CommunityEventDispatcher,
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

  async kickMember(communityId: string, requesterId: string, targetUserId: string): Promise<void> {
    communityId = await this.resolveCommunityId(communityId);
    return this.dataSource.transaction(async manager => {
      const requester = await manager.findOne(CommunityMemberEntity, { where: { communityId, userId: requesterId, status: CommunityMemberStatus.ACTIVE } });
      if (!requester) {
        throw new ForbiddenException('You are not a member of this community');
      }
      
      const target = await manager.findOne(CommunityMemberEntity, { where: { communityId, userId: targetUserId, status: CommunityMemberStatus.ACTIVE } });
      if (!target) {
        throw new NotFoundException('Target user is not an active member');
      }

      if (target.isOwner) {
        throw new BadRequestException('Cannot kick the community owner');
      }

      // Check roles/permissions (simplified for now - must be owner or have kick permission)
      const requesterRole = requester.roleId ? await this.roleRepo.findById(requester.roleId) : null;
      if (!requester.isOwner && !requesterRole?.permissions.includes('member.kick')) {
        throw new ForbiddenException('You do not have permission to kick members');
      }

      target.status = CommunityMemberStatus.KICKED;
      await manager.save(target);

      const community = await manager.findOne(CommunityEntity, { where: { id: communityId }, lock: { mode: 'pessimistic_write' } });
      if (community) {
        community.currentMemberCount = Math.max(0, community.currentMemberCount - 1);
        await manager.save(community);
        await manager.update(CommunityStatisticsEntity, { communityId }, { memberCount: community.currentMemberCount });
      }

      this.eventDispatcher.dispatchMemberKicked(communityId, targetUserId, requesterId);
    });
  }

  async banMember(communityId: string, requesterId: string, targetUserId: string, reason?: string, permanent: boolean = true, expiresAt?: Date): Promise<void> {
    communityId = await this.resolveCommunityId(communityId);
    return this.dataSource.transaction(async manager => {
      const requester = await manager.findOne(CommunityMemberEntity, { where: { communityId, userId: requesterId, status: CommunityMemberStatus.ACTIVE } });
      if (!requester) {
        throw new ForbiddenException('You are not a member of this community');
      }

      const requesterRole = requester.roleId ? await this.roleRepo.findById(requester.roleId) : null;
      if (!requester.isOwner && !requesterRole?.permissions.includes('member.ban')) {
        throw new ForbiddenException('You do not have permission to ban members');
      }

      const target = await manager.findOne(CommunityMemberEntity, { where: { communityId, userId: targetUserId } });
      if (target && target.isOwner) {
        throw new BadRequestException('Cannot ban the community owner');
      }

      if (target && target.status === CommunityMemberStatus.ACTIVE) {
        target.status = CommunityMemberStatus.BANNED;
        await manager.save(target);
        
        const community = await manager.findOne(CommunityEntity, { where: { id: communityId }, lock: { mode: 'pessimistic_write' } });
        if (community) {
          community.currentMemberCount = Math.max(0, community.currentMemberCount - 1);
          await manager.save(community);
          await manager.update(CommunityStatisticsEntity, { communityId }, { memberCount: community.currentMemberCount });
        }
      }

      await this.banRepo.create({
        communityId,
        userId: targetUserId,
        bannedBy: requesterId,
        reason,
        permanent,
        expiresAt,
      });

      this.eventDispatcher.dispatchMemberBanned(communityId, targetUserId, requesterId);
    });
  }

  async muteMember(communityId: string, requesterId: string, targetUserId: string, durationMinutes: number): Promise<void> {
    communityId = await this.resolveCommunityId(communityId);
    const requester = await this.memberRepo.findByUserAndCommunity(requesterId, communityId);
    if (!requester || requester.status !== CommunityMemberStatus.ACTIVE) {
      throw new ForbiddenException('You are not an active member');
    }

    const requesterRole = requester.roleId ? await this.roleRepo.findById(requester.roleId) : null;
    if (!requester.isOwner && !requesterRole?.permissions.includes('member.mute')) {
      throw new ForbiddenException('You do not have permission to mute members');
    }

    const target = await this.memberRepo.findByUserAndCommunity(targetUserId, communityId);
    if (!target || target.status !== CommunityMemberStatus.ACTIVE) {
      throw new NotFoundException('Target user is not an active member');
    }

    if (target.isOwner) {
      throw new BadRequestException('Cannot mute the community owner');
    }

    const mutedUntil = new Date(Date.now() + durationMinutes * 60000);
    target.isMuted = true;
    target.mutedUntil = mutedUntil;
    await this.memberRepo.create(target); // save

    this.eventDispatcher.dispatchMemberMuted(communityId, targetUserId, requesterId, mutedUntil);
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
    });
  }

  async updateRole(communityId: string, requesterId: string, targetUserId: string, newRoleId: string): Promise<void> {
    communityId = await this.resolveCommunityId(communityId);
    const requester = await this.memberRepo.findByUserAndCommunity(requesterId, communityId);
    const target = await this.memberRepo.findByUserAndCommunity(targetUserId, communityId);

    if (!requester || !target) {
      throw new NotFoundException('Member not found');
    }

    if (target.isOwner) {
      throw new BadRequestException('Cannot change the role of the community owner');
    }

    const requesterRole = requester.roleId ? await this.roleRepo.findById(requester.roleId) : null;
    if (!requester.isOwner && !requesterRole?.permissions.includes('role.manage')) {
      throw new ForbiddenException('You do not have permission to manage roles');
    }

    let roleToAssign = await this.roleRepo.findById(newRoleId);
    if (!roleToAssign) {
      roleToAssign = await this.roleRepo.findByName(newRoleId.toUpperCase());
    }
    if (!roleToAssign) {
      throw new NotFoundException('Role not found');
    }

    target.roleId = roleToAssign.id;
    await this.memberRepo.create(target); // save

    this.eventDispatcher.dispatchRoleChanged(communityId, targetUserId, roleToAssign.id, requesterId);
  }
}
