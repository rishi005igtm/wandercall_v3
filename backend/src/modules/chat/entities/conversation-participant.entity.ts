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

@Entity('chat_participants')
@Index(['conversationId', 'userId'], { unique: true })
@Index(['userId', 'updatedAt'])
@Index(['conversationId'])
export class ConversationParticipantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  conversationId: string;

  @Column('uuid')
  userId: string;

  /** Timestamp of the last message this user has read */
  @Column({ type: 'timestamp', nullable: true })
  lastReadAt?: Date;

  /** Timestamp when this user joined (for group chats) */
  @Column({ type: 'timestamp', nullable: true })
  joinedAt?: Date;

  /** Whether this user is an admin (relevant for group/campfire chats) */
  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  /** Whether this user has left the conversation (soft leave) */
  @Column({ type: 'boolean', default: false })
  hasLeft: boolean;

  /** Whether this user has muted this conversation */
  @Column({ type: 'boolean', default: false })
  isMuted: boolean;

  @ManyToOne(() => ConversationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: ConversationEntity;

  @ManyToOne(() => UserProfileEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  user: UserProfileEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<ConversationParticipantEntity>) {
    Object.assign(this, partial);
  }
}
