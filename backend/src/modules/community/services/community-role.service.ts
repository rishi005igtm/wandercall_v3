import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CommunityRoleRepository } from '../repositories/community-role.repository';
import { CommunityMemberRepository } from '../repositories/community-member.repository';
import { CommunityRoleEntity } from '../entities/community-role.entity';
import { CommunityMemberEntity, CommunityMemberStatus } from '../entities/community-member.entity';
import { CommunityPermissionService } from './community-permission.service';
import { CommunityAuditService } from './community-audit.service';
import { CommunityAuditAction } from '../entities/community-audit-log.entity';
import { CommunityEventDispatcher } from '../events/community-event.dispatcher';

@Injectable()
export class CommunityRoleService {
  private readonly logger = new Logger(CommunityRoleService.name);

  constructor(
    private readonly roleRepo: CommunityRoleRepository,
    private readonly memberRepo: CommunityMemberRepository,
    private readonly permissionService: CommunityPermissionService,
    private readonly auditService: CommunityAuditService,
    private readonly eventDispatcher: CommunityEventDispatcher,
  ) {}

  async getAllRoles(): Promise<CommunityRoleEntity[]> {
    const roles = await this.roleRepo.find({ order: { priority: 'ASC' } });
    const allowed = ['OWNER', 'ADMIN', 'MEMBER', 'GUEST'];
    return roles.filter(r => allowed.includes(r.name));
  }

  async getRoleById(roleId: string): Promise<CommunityRoleEntity | null> {
    return this.roleRepo.findById(roleId);
  }

  async createCustomRole(params: {
    name: string;
    displayName: string;
    displayColor?: string;
    priority?: number;
    permissions?: string[];
  }): Promise<CommunityRoleEntity> {
    const formattedName = params.name.trim().toUpperCase().replace(/\s+/g, '_');
    const existing = await this.roleRepo.findByName(formattedName);
    if (existing) {
      throw new ConflictException(`Role with name ${formattedName} already exists`);
    }

    const priority = params.priority ?? 80; // Default below MODERATOR (20) and above MEMBER (100)
    if (priority <= 1) {
      throw new BadRequestException('Priority <= 1 is reserved for OWNER');
    }

    const newRole = await this.roleRepo.createRole({
      name: formattedName,
      displayName: params.displayName || params.name,
      displayColor: params.displayColor || '#A855F7',
      priority,
      systemRole: false,
      editable: true,
      protected: false,
      permissions: params.permissions || ['post.create', 'chat.send', 'story.create'],
    });

    return newRole;
  }

  async updateRole(
    roleId: string,
    params: {
      displayName?: string;
      displayColor?: string;
      priority?: number;
      permissions?: string[];
    },
  ): Promise<CommunityRoleEntity> {
    const role = await this.roleRepo.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (!role.editable && role.systemRole) {
      // Allow modifying displayColor and non-destructive additions to permissions if needed,
      // but prevent changing core identity or setting priority <= 1
      if (params.priority !== undefined && params.priority !== role.priority) {
        throw new ForbiddenException(`Cannot change priority of system role ${role.name}`);
      }
    }

    if (params.priority !== undefined && params.priority <= 1 && role.name !== 'OWNER') {
      throw new BadRequestException('Priority <= 1 is strictly reserved for OWNER');
    }

    if (params.displayName !== undefined) role.displayName = params.displayName;
    if (params.displayColor !== undefined) role.displayColor = params.displayColor;
    if (params.priority !== undefined) role.priority = params.priority;
    if (params.permissions !== undefined) role.permissions = params.permissions;

    return this.roleRepo.save(role);
  }

  async deleteRole(roleId: string): Promise<void> {
    const role = await this.roleRepo.findById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.protected || role.systemRole) {
      throw new ForbiddenException(`System or protected role '${role.name}' cannot be deleted`);
    }

    // Reassign any active members who hold this role back to standard MEMBER
    const defaultMemberRole = await this.roleRepo.findByName('MEMBER');
    if (defaultMemberRole) {
      const affectedMembers = await this.memberRepo.find({ where: { roleId: role.id } });
      for (const m of affectedMembers) {
        m.roleId = defaultMemberRole.id;
        await this.memberRepo.save(m);
      }
    }

    await this.roleRepo.remove(role);
  }

  async assignRole(
    communityId: string,
    actorId: string,
    targetUserId: string,
    roleIdOrName: string,
    reason?: string,
  ): Promise<CommunityMemberEntity> {
    const id = await this.permissionService.resolveCommunityId(communityId);

    // 1. Check actor permissions ('role.assign' or 'role.manage')
    const { member: actorMember, role: actorRole } = await this.permissionService.requirePermission(id, actorId, 'role.assign');

    // 2. Find target member
    const targetMember = await this.memberRepo.findByUserAndCommunity(targetUserId, id);
    if (!targetMember || targetMember.status !== CommunityMemberStatus.ACTIVE) {
      throw new NotFoundException('Target user is not an active member of this community');
    }

    if (targetMember.isOwner) {
      throw new BadRequestException('Cannot change the role of the community owner. Use transfer ownership.');
    }

    // 3. Resolve role to assign
    let roleToAssign = await this.roleRepo.findById(roleIdOrName);
    if (!roleToAssign) {
      const normalized = roleIdOrName.trim().toUpperCase().replace(/\s+/g, '_');
      roleToAssign = await this.roleRepo.findByName(normalized);
      if (!roleToAssign && (normalized === 'COMMUNITY_GUIDE' || normalized === 'GUIDE')) {
        roleToAssign = await this.roleRepo.findByName('GUIDE');
      }
      if (!roleToAssign) {
        const allRoles = await this.roleRepo.findAll();
        roleToAssign = allRoles.find(r =>
          r.displayName?.toLowerCase() === roleIdOrName.trim().toLowerCase() ||
          r.name === normalized
        ) || null;
      }
    }
    if (!roleToAssign) {
      throw new NotFoundException(`Role '${roleIdOrName}' not found`);
    }

    if (roleToAssign.name === 'OWNER') {
      throw new BadRequestException('Cannot assign OWNER role directly. Use transfer ownership.');
    }

    // 4. Check priority hierarchy: actor priority MUST be strictly lower numeric (higher rank) than BOTH target current role AND new role to assign
    const targetCurrentRole = targetMember.roleId ? await this.roleRepo.findById(targetMember.roleId) : null;
    this.permissionService.enforceHierarchy(actorRole, actorMember.isOwner, targetCurrentRole, targetMember.isOwner, 'change role of');

    if (!actorMember.isOwner && (actorRole?.priority ?? 1000) >= roleToAssign.priority) {
      throw new ForbiddenException(`You cannot assign a role equal to or higher than your own rank (${roleToAssign.displayName || roleToAssign.name})`);
    }

    const oldRoleName = targetCurrentRole?.displayName || targetCurrentRole?.name || 'MEMBER';
    const newRoleName = roleToAssign.displayName || roleToAssign.name;

    // 5. Update target member role
    targetMember.roleId = roleToAssign.id;
    const updatedMember = await this.memberRepo.save(targetMember);

    // 6. Dispatch event & log immutable audit action
    this.eventDispatcher.dispatchRoleChanged(id, targetUserId, roleToAssign.id, actorId);
    await this.auditService.logAction({
      communityId: id,
      actorId,
      targetUserId,
      action: CommunityAuditAction.ROLE_ASSIGN,
      reason: reason || `Changed role from ${oldRoleName} to ${newRoleName}`,
      oldRole: oldRoleName,
      newRole: newRoleName,
      metadata: { roleId: roleToAssign.id, roleName: roleToAssign.name },
    });

    return updatedMember;
  }
}
