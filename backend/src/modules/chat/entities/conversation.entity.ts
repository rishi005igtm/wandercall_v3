import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  CAMPFIRE = 'CAMPFIRE',
  COMMUNITY = 'COMMUNITY',
  AI_ASSISTANT = 'AI_ASSISTANT',
}

@Entity('chat_conversations')
@Index(['updatedAt'])
@Index(['participantKey'], {
  unique: true,
  where: '"participantKey" IS NOT NULL',
})
export class ConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: ConversationType.DIRECT,
  })
  type: ConversationType;

  /**
   * Deterministic unique key for DIRECT conversations.
   * Format: "sorted_userA_id:sorted_userB_id"
   * This enforces at the DB level that only ONE direct conversation can exist per user pair.
   * NULL for GROUP / CAMPFIRE / COMMUNITY conversations (those use different identity rules).
   */
  @Column({ type: 'varchar', length: 100, nullable: true, unique: false })
  participantKey?: string;

  /** Last message preview text — stored for fast conversation list rendering */
  @Column({ type: 'text', nullable: true })
  lastMessageText?: string;

  /** FK to MessageEntity — nullable until first message sent */
  @Column({ type: 'uuid', nullable: true })
  lastMessageId?: string;

  /** Sender userId of the last message — for "You: ..." display */
  @Column({ type: 'uuid', nullable: true })
  lastMessageSenderId?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt?: Date;

  /**
   * Unread message counts per user.
   * Stored as { [userId: string]: number }
   * Avoids N+1 queries when rendering conversation list.
   */
  @Column({ type: 'jsonb', default: {} })
  unreadCounts: Record<string, number>;

  /**
   * Flexible metadata for group name, avatar, campfire ID, etc.
   * Structure varies by ConversationType.
   */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  /** Whether the conversation is archived (soft-hide without delete) */
  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<ConversationEntity>) {
    Object.assign(this, partial);
  }
}
