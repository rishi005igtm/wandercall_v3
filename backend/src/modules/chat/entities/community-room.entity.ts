import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CommunityRoomType {
  GENERAL = 'GENERAL',
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  PHOTOS = 'PHOTOS',
  EVENTS = 'EVENTS',
  SUPPORT = 'SUPPORT',
  MARKETPLACE = 'MARKETPLACE',
  VOICE = 'VOICE',
}

@Entity('community_rooms')
@Index(['communityId'])
@Index(['conversationId'], { unique: true })
export class CommunityRoomEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  communityId: string;

  /** Foreign key to the chat_conversations table */
  @Column('uuid')
  conversationId: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: CommunityRoomType.GENERAL,
  })
  type: CommunityRoomType;

  /** If true, this is the default room users see when entering the community */
  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  /** If true, only community owners/admins can post */
  @Column({ type: 'boolean', default: false })
  announcementOnly: boolean;

  /** Minimum seconds between messages for a user (0 = disabled) */
  @Column({ type: 'int', default: 0 })
  slowMode: number;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column('uuid')
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
