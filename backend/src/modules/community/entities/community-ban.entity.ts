import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('community_bans')
@Index(['communityId', 'userId'], { unique: true })
export class CommunityBanEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  communityId: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'uuid' })
  bannedBy: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'boolean', default: false })
  permanent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<CommunityBanEntity>) {
    Object.assign(this, partial);
  }
}
