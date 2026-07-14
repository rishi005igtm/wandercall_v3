import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum CommunityAuditAction {
  MEMBER_BAN = 'MEMBER_BAN',
  MEMBER_UNBAN = 'MEMBER_UNBAN',
  MEMBER_KICK = 'MEMBER_KICK',
  MEMBER_MUTE = 'MEMBER_MUTE',
  MEMBER_UNMUTE = 'MEMBER_UNMUTE',
  MEMBER_WARN = 'MEMBER_WARN',
  ROLE_ASSIGN = 'ROLE_ASSIGN',
  STORY_PIN = 'STORY_PIN',
  STORY_UNPIN = 'STORY_UNPIN',
  STORY_FEATURE = 'STORY_FEATURE',
  STORY_DELETE = 'STORY_DELETE',
  OWNERSHIP_TRANSFER = 'OWNERSHIP_TRANSFER',
  SETTINGS_UPDATE = 'SETTINGS_UPDATE',
}

@Entity('community_audit_logs')
@Index(['communityId', 'createdAt'])
@Index(['communityId', 'actorId'])
@Index(['communityId', 'targetUserId'])
@Index(['communityId', 'action'])
export class CommunityAuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  communityId: string;

  @Column({ type: 'uuid' })
  @Index()
  actorId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  targetUserId?: string;

  @Column({ type: 'varchar', length: 50 })
  action: CommunityAuditAction | string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  oldRole?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  newRole?: string;

  @Column({ type: 'int', nullable: true })
  durationMinutes?: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any; // Stores device, IP, storyId, targetSnapshot, etc.

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<CommunityAuditLogEntity>) {
    Object.assign(this, partial);
  }
}
