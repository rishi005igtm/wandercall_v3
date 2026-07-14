import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CommunityRepository } from '../repositories/community.repository';
import { CommunityMemberRepository } from '../repositories/community-member.repository';
import { CommunityRoleRepository } from '../repositories/community-role.repository';
import {
  CommunityMemberEntity,
  CommunityMemberStatus,
} from '../entities/community-member.entity';
import { CommunityRoleEntity } from '../entities/community-role.entity';

@Injectable()
export class CommunityPermissionService {
  private readonly logger = new Logger(CommunityPermissionService.name);

  constructor(
    private readonly communityRepo: CommunityRepository,
    private readonly memberRepo: CommunityMemberRepository,
    private readonly roleRepo: CommunityRoleRepository,
  ) {}

  async resolveCommunityId(communityIdOrSlug: string): Promise<string> {
    const id = await this.communityRepo.resolveId(communityIdOrSlug);
    if (!id) throw new NotFoundException('Community not found');
    return id;
  }

  /**
   * Evaluates if the user has the required permission in the given community.
   * Throws ForbiddenException if not allowed, or returns the active member and their role.
   */
  async requirePermission(
    communityId: string,
    userId: string,
    requiredPermission: string,
  ): Promise<{
    member: CommunityMemberEntity;
    role: CommunityRoleEntity | null;
  }> {
    const id = await this.resolveCommunityId(communityId);
    const member = await this.memberRepo.findByUserAndCommunity(userId, id);

    if (!member || member.status !== CommunityMemberStatus.ACTIVE) {
      throw new ForbiddenException(
        'You are not an active member of this community',
      );
    }

    if (member.isOwner) {
      const ownerRole = await this.roleRepo.findByName('OWNER');
      return { member, role: ownerRole };
    }

    const role = member.roleId
      ? await this.roleRepo.findById(member.roleId)
      : null;

    if (!role) {
      throw new ForbiddenException(
        'You do not have a valid role in this community',
      );
    }

    // Check wildcard '*' or exact match or uppercase match
    const perms = role.permissions || [];
    if (
      perms.includes('*') ||
      perms.includes(requiredPermission) ||
      perms.includes(requiredPermission.toLowerCase()) ||
      perms.includes(requiredPermission.toUpperCase())
    ) {
      return { member, role };
    }

    throw new ForbiddenException(
      `You do not have permission: ${requiredPermission}`,
    );
  }

  /**
   * Enforces role priority safeguards.
   * Lower number = higher priority (e.g. 1=OWNER, 10=ADMIN, 20=MODERATOR, 100=MEMBER).
   * An actor CANNOT moderate or demote a target who has equal or higher priority (`actorPriority >= targetPriority`).
   */
  enforceHierarchy(
    actorRole: CommunityRoleEntity | null,
    actorIsOwner: boolean,
    targetRole: CommunityRoleEntity | null,
    targetIsOwner: boolean,
    actionDescription = 'moderate',
  ): void {
    if (targetIsOwner) {
      throw new BadRequestException(
        `Cannot ${actionDescription} the community owner`,
      );
    }

    if (actorIsOwner) {
      return; // Owner can moderate anyone except another owner (which doesn't exist)
    }

    const actorPriority = actorRole?.priority ?? 1000;
    const targetPriority = targetRole?.priority ?? 100;

    if (actorPriority >= targetPriority) {
      throw new ForbiddenException(
        `Cannot ${actionDescription} a member with equal or higher rank (${targetRole?.displayName || targetRole?.name || 'MEMBER'})`,
      );
    }
  }

  /**
   * Checks if the member has admin/moderator access to view the Admin Dashboard.
   */
  async canAccessAdmin(communityId: string, userId: string): Promise<boolean> {
    try {
      await this.requirePermission(communityId, userId, 'settings.update');
      return true;
    } catch {
      try {
        await this.requirePermission(communityId, userId, 'member.kick');
        return true;
      } catch {
        return false;
      }
    }
  }
}
