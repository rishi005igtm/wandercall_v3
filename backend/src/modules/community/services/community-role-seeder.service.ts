import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityRoleEntity } from '../entities/community-role.entity';

export const SYSTEM_ROLES = [
  {
    name: 'OWNER',
    displayName: 'Community Owner',
    displayColor: '#EF4444',
    priority: 1,
    systemRole: true,
    editable: false,
    protected: true,
    permissions: [
      '*',
      'COMMUNITY_DELETE',
      'COMMUNITY_SETTINGS',
      'TRANSFER_OWNERSHIP',
      'INVITE_USERS',
      'BAN_USERS',
      'ASSIGN_ROLES',
      'EDIT_DESCRIPTION',
      'community.delete',
      'community.update',
      'settings.update',
      'role.assign',
      'role.manage',
      'member.invite',
      'member.kick',
      'member.ban',
      'member.mute',
      'post.create',
      'post.delete',
      'post.pin',
      'chat.send',
      'chat.moderate',
      'story.create',
      'story.delete',
      'event.create',
      'event.manage',
    ],
  },
  {
    name: 'ADMIN',
    displayName: 'Administrator',
    displayColor: '#F97316',
    priority: 10,
    systemRole: true,
    editable: false,
    protected: true,
    permissions: [
      'COMMUNITY_SETTINGS',
      'INVITE_USERS',
      'BAN_USERS',
      'ASSIGN_ROLES',
      'EDIT_DESCRIPTION',
      'community.update',
      'settings.update',
      'role.assign',
      'member.invite',
      'member.kick',
      'member.ban',
      'member.mute',
      'post.create',
      'post.delete',
      'post.pin',
      'chat.send',
      'chat.moderate',
      'story.create',
      'story.delete',
      'event.create',
      'event.manage',
    ],
  },
  {
    name: 'MEMBER',
    displayName: 'Member',
    displayColor: '#3B82F6',
    priority: 100,
    systemRole: true,
    editable: false,
    protected: true,
    permissions: [
      'INVITE_USERS',
      'member.invite',
      'post.create',
      'chat.send',
      'story.create',
    ],
  },
  {
    name: 'GUEST',
    displayName: 'Guest',
    displayColor: '#6B7280',
    priority: 200,
    systemRole: true,
    editable: false,
    protected: true,
    permissions: ['post.view', 'chat.view'],
  },
];

@Injectable()
export class CommunityRoleSeederService {
  private readonly logger = new Logger(CommunityRoleSeederService.name);

  constructor(
    @InjectRepository(CommunityRoleEntity)
    private readonly roleRepo: Repository<CommunityRoleEntity>,
  ) {}

  async seedSystemRoles(): Promise<void> {
    try {
      for (const roleDef of SYSTEM_ROLES) {
        const existing = await this.roleRepo.findOne({
          where: { name: roleDef.name },
        });
        if (!existing) {
          const newRole = this.roleRepo.create(roleDef);
          await this.roleRepo.save(newRole);
        } else {
          existing.displayName = roleDef.displayName;
          existing.displayColor = roleDef.displayColor;
          existing.priority = roleDef.priority;
          existing.systemRole = roleDef.systemRole;
          existing.editable = roleDef.editable;
          existing.protected = roleDef.protected;
          existing.permissions = roleDef.permissions;
          await this.roleRepo.save(existing);
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to seed system community roles: ${error.message}`,
        error.stack,
      );
    }
  }
}
