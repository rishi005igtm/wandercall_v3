import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum CommunityMemberStatus {
  ACTIVE = 'ACTIVE',
  LEFT = 'LEFT',
  BANNED = 'BANNED',
  KICKED = 'KICKED',
  REMOVED = 'REMOVED',
  PENDING = 'PENDING',
  INVITED = 'INVITED',
}

@Entity('community_members')
@Index(['communityId', 'userId'], { unique: true })
export class CommunityMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  communityId: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'uuid', nullable: true })
  roleId?: string; // Foreign key to community_roles

  @Column({ type: 'uuid', nullable: true })
  joinedBy?: string; // ID of the user who invited/approved them, if any

  @Column({ type: 'boolean', default: false })
  isMuted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  mutedUntil?: Date;

  @Column({ type: 'boolean', default: false })
  isOwner: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nickname?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSeenAt?: Date;

  @Column({ type: 'varchar', length: 20, default: CommunityMemberStatus.ACTIVE })
  status: CommunityMemberStatus;

  @CreateDateColumn()
  joinedAt: Date; // equivalent to createdAt for when they joined

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<CommunityMemberEntity>) {
    Object.assign(this, partial);
  }
}
