import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import {
  CampfireStatus,
  CampfireVisibility,
  CampfireCategory,
  CampfireMood,
} from '../constants/campfire.constant';

@Entity('campfires')
export class CampfireEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  communityId: string;

  @Index()
  @Column({ type: 'uuid' })
  hostId: string;

  @Index()
  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CampfireStatus,
    default: CampfireStatus.DRAFT,
  })
  status: CampfireStatus;

  @Column({
    type: 'enum',
    enum: CampfireVisibility,
    default: CampfireVisibility.PUBLIC,
  })
  visibility: CampfireVisibility;

  @Column({
    type: 'enum',
    enum: CampfireCategory,
    default: CampfireCategory.ADVENTURE,
  })
  category: CampfireCategory;

  @Column({
    type: 'enum',
    enum: CampfireMood,
    default: CampfireMood.STORYTELLING,
  })
  mood: CampfireMood;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'int', default: 50 })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  currentParticipants: number;

  @Column({ type: 'timestamp', nullable: true })
  scheduledStartAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // Virtual fields for Discovery/Responses
  hostName?: string;
  hostAvatar?: string | null;
  hostUsername?: string | null;
  participantsCount?: number;
  isHostOnline?: boolean;
  onlineUserIds?: string[];
}
