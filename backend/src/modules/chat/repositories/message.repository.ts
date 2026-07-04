import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { MessageEntity, MessageStatus } from '../entities/message.entity';
import { DEFAULT_MESSAGE_PAGE_SIZE, MAX_MESSAGE_PAGE_SIZE } from '../constants/chat.constants';

export interface PaginatedMessages {
  items: MessageEntity[];
  nextCursor?: string;
  hasMore: boolean;
}

@Injectable()
export class MessageRepository {
  private readonly logger = new Logger(MessageRepository.name);

  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
  ) {}

  /**
   * Persist a new message to the database.
   */
  async save(message: MessageEntity): Promise<MessageEntity> {
    return this.messageRepo.save(message);
  }

  /**
   * Find a message by its server-assigned ID.
   */
  async findById(id: string): Promise<MessageEntity | null> {
    return this.messageRepo.findOne({ where: { id } });
  }

  /**
   * Find a message by the client-generated UUID.
   * Used for idempotency — prevents duplicate messages on client retry.
   */
  async findByClientMessageId(clientMessageId: string): Promise<MessageEntity | null> {
    return this.messageRepo.findOne({ where: { clientMessageId } });
  }

  /**
   * Cursor-based pagination for conversation message history.
   * Fetches messages BEFORE the cursor (older messages).
   * Ordered newest-first within the cursor window, then reversed for display.
   */
  async paginate(
    conversationId: string,
    limit: number = DEFAULT_MESSAGE_PAGE_SIZE,
    cursor?: string,
  ): Promise<PaginatedMessages> {
    const safeLimit = Math.min(limit, MAX_MESSAGE_PAGE_SIZE);

    const qb = this.messageRepo
      .createQueryBuilder('msg')
      .where('msg.conversationId = :conversationId', { conversationId })
      .andWhere('msg.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('msg.createdAt', 'DESC')
      .take(safeLimit + 1);

    if (cursor) {
      qb.andWhere('msg.createdAt < :cursor', { cursor: new Date(cursor) });
    }

    const raw = await qb.getMany();
    const hasMore = raw.length > safeLimit;
    if (hasMore) raw.pop();

    const nextCursor = hasMore && raw.length > 0
      ? raw[raw.length - 1].createdAt.toISOString()
      : undefined;

    // Reverse so oldest is first (chronological display order)
    return { items: raw.reverse(), nextCursor, hasMore };
  }

  /**
   * Get unread messages in a conversation for a user since their lastReadAt.
   */
  async findUnread(conversationId: string, userId: string, since?: Date): Promise<MessageEntity[]> {
    const qb = this.messageRepo
      .createQueryBuilder('msg')
      .where('msg.conversationId = :conversationId', { conversationId })
      .andWhere('msg.senderId != :userId', { userId })
      .andWhere('msg.isDeleted = false')
      .andWhere('msg.status != :status', { status: MessageStatus.READ })
      .orderBy('msg.createdAt', 'ASC');

    if (since) {
      qb.andWhere('msg.createdAt > :since', { since });
    }

    return qb.getMany();
  }

  /**
   * Mark a single message as delivered.
   * Returns the updated message or null if not found.
   */
  async markDelivered(messageId: string): Promise<MessageEntity | null> {
    const message = await this.findById(messageId);
    if (!message || message.status === MessageStatus.READ) return null;

    message.status = MessageStatus.DELIVERED;
    message.deliveredAt = new Date();
    return this.messageRepo.save(message);
  }

  /**
   * Mark all undelivered messages in a conversation as delivered for a user.
   * Called when user reconnects — delivers all pending messages in bulk.
   */
  async markAllDelivered(conversationId: string, recipientId: string): Promise<void> {
    await this.messageRepo
      .createQueryBuilder()
      .update(MessageEntity)
      .set({ status: MessageStatus.DELIVERED, deliveredAt: new Date() })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('senderId != :recipientId', { recipientId })
      .andWhere('status = :status', { status: MessageStatus.SENT })
      .andWhere('isDeleted = false')
      .execute();
  }

  /**
   * Mark a message as read.
   */
  async markRead(messageId: string): Promise<MessageEntity | null> {
    const message = await this.findById(messageId);
    if (!message) return null;

    message.status = MessageStatus.READ;
    message.readAt = new Date();
    return this.messageRepo.save(message);
  }

  /**
   * Soft-edit a message's text.
   */
  async edit(messageId: string, newText: string): Promise<MessageEntity | null> {
    const message = await this.findById(messageId);
    if (!message || message.isDeleted) return null;

    message.text = newText;
    message.isEdited = true;
    message.status = MessageStatus.EDITED;
    return this.messageRepo.save(message);
  }

  /**
   * Soft-delete a message.
   */
  async softDelete(messageId: string): Promise<MessageEntity | null> {
    const message = await this.findById(messageId);
    if (!message) return null;

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.status = MessageStatus.DELETED;
    message.text = undefined;
    message.attachments = undefined;
    return this.messageRepo.save(message);
  }

  /**
   * Search messages by text in a conversation.
   */
  async search(conversationId: string, query: string, limit = 20): Promise<MessageEntity[]> {
    return this.messageRepo
      .createQueryBuilder('msg')
      .where('msg.conversationId = :conversationId', { conversationId })
      .andWhere('msg.isDeleted = false')
      .andWhere('msg.text ILIKE :query', { query: `%${query}%` })
      .orderBy('msg.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }
}
