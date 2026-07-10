import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  CampfireCategory,
  CampfireMood,
  CampfireStatus,
  CampfireVisibility,
} from '../constants/campfire.constant';

@Entity('campfires')
export class CampfireEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  communityId: string;

  @Column({ type: 'uuid' })
  @Index()
  hostId: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, default: CampfireCategory.ADVENTURE })
  category: CampfireCategory;

  @Column({ type: 'varchar', length: 50, default: CampfireMood.STORYTELLING })
  mood: CampfireMood;

  @Column({ type: 'varchar', length: 20, default: CampfireVisibility.PUBLIC })
  @Index()
  visibility: CampfireVisibility;

  @Column({ type: 'varchar', length: 20, default: CampfireStatus.SCHEDULED })
  @Index()
  status: CampfireStatus;

  @Column({ type: 'int', default: 50 })
  capacity: number;

  @Column({ type: 'int', default: 10 })
  speakerLimit: number;

  @Column({ type: 'int', default: 40 })
  listenerLimit: number;

  @Column({ type: 'int', default: 0 })
  currentSpeakers: number;

  @Column({ type: 'int', default: 0 })
  currentListeners: number;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  scheduledStartAt?: Date;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  remindedUserIds?: string[];

  @Column({ type: 'jsonb', nullable: true, default: [] })
  joinedUserIds?: string[];

  @Column({ type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  livekitRoom?: string;

  @Column({ type: 'boolean', default: false })
  isLocked: boolean;

  @Column({ type: 'boolean', default: false })
  isRecording: boolean;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  settings?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, default: {} })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  // Virtual fields populated by joins or services
  hostName?: string;
  hostAvatar?: string;
  hostUsername?: string;

  constructor(partial: Partial<CampfireEntity>) {
    Object.assign(this, partial);
  }
}
