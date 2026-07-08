import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProfileEntity } from '../../user/entities/user-profile.entity';
import { ConversationEntity } from './conversation.entity';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  EXPERIENCE_CARD = 'EXPERIENCE_CARD',
  PLAN_CARD = 'PLAN_CARD',
  CAMPFIRE_INVITE = 'CAMPFIRE_INVITE',
  COMMUNITY_INVITE = 'COMMUNITY_INVITE',
  SYSTEM = 'SYSTEM',
}

export enum MessageStatus {
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  EDITED = 'EDITED',
  DELETED = 'DELETED',
  FAILED = 'FAILED',
}

@Entity('chat_messages')
@Index(['conversationId', 'createdAt'])
@Index(['conversationId', 'status'])
@Index(['senderId', 'createdAt'])
@Index(['clientMessageId'], { unique: true })
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Client-generated UUID sent with every message.
   * Unique constraint prevents duplicate messages on retry.
   * The client generates this before the optimistic update.
   */
  @Column({ type: 'uuid', unique: true })
  clientMessageId: string;

  @Column('uuid')
  conversationId: string;

  /**
   * Sequence number scoped to the conversationId.
   * Ensures deterministic ordering of messages.
   */
  @Column({ type: 'int', default: 0 })
  sequenceNumber: number;

  @Column('uuid')
  senderId: string;

  @Column({
    type: 'varchar',
    length: 30,
    default: MessageType.TEXT,
  })
  type: MessageType;

  @Column({ type: 'text', nullable: true })
  text?: string;

  /**
   * Attachment metadata array.
   * Each item: { url, publicId, mimeType, size, name, width?, height?, duration? }
   */
  @Column({ type: 'jsonb', nullable: true })
  attachments?: any[];

  /** ID of the message being replied to */
  @Column({ type: 'uuid', nullable: true })
  replyToId?: string;

  /** ID of the message this was forwarded from */
  @Column({ type: 'uuid', nullable: true })
  forwardedFromId?: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  /** Array of userIds mentioned with @username */
  @Column({ type: 'jsonb', nullable: true, default: [] })
  mentions?: string[];

  /**
   * Emoji reactions.
   * Structure: { [emoji: string]: string[] } — value is array of userIds
   */
  @Column({ type: 'jsonb', nullable: true, default: {} })
  reactions?: Record<string, string[]>;

  /** Rich metadata for special message types (experience cards, plan cards, etc.) */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ManyToOne(() => ConversationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: ConversationEntity;

  @ManyToOne(() => UserProfileEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'senderId', referencedColumnName: 'userId' })
  sender: UserProfileEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<MessageEntity>) {
    Object.assign(this, partial);
  }
}
