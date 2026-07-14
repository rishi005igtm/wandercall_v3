import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Index,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserProfileEntity } from '../../user/entities/user-profile.entity';

@Entity('user_privacy_relations')
@Index(['userId', 'targetUserId'], { unique: true })
@Index(['userId'])
@Index(['targetUserId'])
export class PrivacyRelationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  targetUserId: string;

  @ManyToOne(() => UserProfileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  user: UserProfileEntity;

  @ManyToOne(() => UserProfileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'targetUserId', referencedColumnName: 'userId' })
  targetUser: UserProfileEntity;

  @Column({ type: 'boolean', default: false })
  isBlocked: boolean;

  @Column({ type: 'boolean', default: false })
  isMuted: boolean;

  @Column({ type: 'boolean', default: false })
  isRestricted: boolean;

  @Column({ type: 'boolean', default: false })
  hideStories: boolean;

  @Column({ type: 'boolean', default: false })
  hideMemories: boolean;

  @Column({ type: 'boolean', default: false })
  hideFeed: boolean;

  @Column({ type: 'boolean', default: false })
  hideCampfires: boolean;

  @Column({ type: 'varchar', nullable: true, length: 255 })
  reason?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<PrivacyRelationEntity>) {
    Object.assign(this, partial);
  }
}
