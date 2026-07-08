import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('conversation_member_state')
@Index(['conversationId', 'userId'], { unique: true })
export class ConversationMemberStateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  conversationId: string;

  @Column('uuid')
  userId: string;

  /**
   * The sequence number of the last message the user saw.
   * Enables highly scalable read receipt calculation without tracking per-message.
   */
  @Column({ type: 'int', default: 0 })
  lastReadSequence: number;

  /**
   * The sequence number of the last message delivered to the user's device.
   */
  @Column({ type: 'int', default: 0 })
  lastDeliveredSequence: number;

  /**
   * General last seen indicator.
   */
  @Column({ type: 'int', default: 0 })
  lastSeenSequence: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
