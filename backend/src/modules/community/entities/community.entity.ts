import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommunityVisibility, CommunityStatus } from '../constants/community.constant';

@Entity('communities')
export class CommunityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cover?: string;

  @Column({ type: 'varchar', length: 20, default: CommunityVisibility.PUBLIC })
  @Index()
  visibility: CommunityVisibility;

  @Column({ type: 'varchar', length: 20, default: CommunityStatus.ACTIVE })
  status: CommunityStatus;

  @Column({ type: 'uuid' })
  @Index()
  ownerId: string;

  @Column({ type: 'uuid' })
  @Index()
  primaryCategoryId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  coordinateId?: string;

  @Column({ type: 'int', default: 500 })
  memberLimit: number;

  @Column({ type: 'int', default: 1 })
  currentMemberCount: number;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column({ type: 'boolean', default: false })
  official: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  archivedAt?: Date;

  constructor(partial: Partial<CommunityEntity>) {
    Object.assign(this, partial);
  }
}
