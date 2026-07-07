import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum CommunityInviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
  CANCELED = 'CANCELED',
}

@Entity('community_invites')
@Index(['communityId', 'receiverId', 'status'])
export class CommunityInviteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  communityId: string;

  @Column({ type: 'uuid' })
  @Index()
  senderId: string;

  @Column({ type: 'uuid' })
  @Index()
  receiverId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  conversationId?: string;

  @Column({ type: 'uuid', nullable: true })
  messageId?: string;

  @Column({ type: 'varchar', length: 20, default: CommunityInviteStatus.PENDING })
  status: CommunityInviteStatus;

  @CreateDateColumn()
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  declinedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<CommunityInviteEntity>) {
    Object.assign(this, partial);
  }
}
