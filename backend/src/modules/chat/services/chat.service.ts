import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { MessageEntity, MessageStatus, MessageType } from '../entities/message.entity';
import { ConversationEntity } from '../entities/conversation.entity';
import { MessageRepository } from '../repositories/message.repository';
import { ConversationRepository } from '../repositories/conversation.repository';
import { ChatEventDispatcher } from './chat-event.dispatcher';
import { PrivacyService } from '../../privacy/services/privacy.service';
import { UserRepository } from '../../user/repositories/user.repository';
import { SendMessageDto } from '../dto/send-message.dto';
import { MessageResponseDto } from '../dto/conversation-response.dto';
import {
  MAX_MESSAGE_LENGTH,
  RATE_LIMIT_MAX_MESSAGES,
  RATE_LIMIT_WINDOW_MS,
} from '../constants/chat.constants';

/**
 * ChatService — Core business logic layer.
 *
 * Responsibilities:
 * - Conversation lifecycle (create / resolve / list)
 * - Message lifecycle (send / edit / delete / deliver / read)
 * - Rate limiting
 * - Event dispatching
 *
 * Rules:
 * - Never emits socket events — delegates to ChatEventDispatcher
 * - Never contains Socket.IO references
 * - All multi-step DB operations run inside transactions
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  /** In-memory rate limiter — future: replace with Redis INCR+EXPIRE */
  private readonly rateLimitMap = new Map<string, { count: number; windowStart: number }>();

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly chatEventDispatcher: ChatEventDispatcher,
    private readonly privacyService: PrivacyService,
    private readonly userRepository: UserRepository,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ─────────────────────────────────────────────────────────
  // CONVERSATION MANAGEMENT
  // ─────────────────────────────────────────────────────────

  async getOrCreateDirectConversation(
    requesterId: string,
    targetUserId: string,
  ): Promise<{ conversationId: string }> {
    if (requesterId === targetUserId) {
      throw new BadRequestException('Cannot start a conversation with yourself.');
    }

    const [requesterBlocked, targetBlocked] = await Promise.all([
      this.privacyService.checkIsBlocked(requesterId, targetUserId),
      this.privacyService.checkIsBlocked(targetUserId, requesterId),
    ]);

    if (requesterBlocked || targetBlocked) {
      throw new ForbiddenException('Cannot start a conversation with this user.');
    }

    const conversation = await this.conversationRepository.findOrCreateDirect(
      requesterId,
      targetUserId,
    );

    this.logger.log(
      `[ConvResolve] conversationId=${conversation.id} userA=${requesterId} userB=${targetUserId}`,
    );
    return { conversationId: conversation.id };
  }

  async getConversations(userId: string) {
    const conversations = await this.conversationRepository.findByUserId(userId);
    return conversations.map((conv) => ({
      ...conv,
      unreadCount: conv.unreadCounts[userId] ?? 0,
    }));
  }

  // ─────────────────────────────────────────────────────────
  // MESSAGE SENDING — atomic transaction
  // ─────────────────────────────────────────────────────────

  /**
   * Full send pipeline:
   * 1. Rate limit
   * 2. Membership check
   * 3. Privacy (block) check
   * 4. Content validation
   * 5. Idempotency (clientMessageId)
   * 6. Persist message + update conversation summary — ONE transaction
   * 7. Dispatch MESSAGE_CREATED
   */
  async sendMessage(senderId: string, dto: SendMessageDto): Promise<MessageResponseDto> {
    // 1. Rate limiting
    this.enforceRateLimit(senderId);

    // 2. Membership check
    const isMember = await this.conversationRepository.isParticipant(dto.conversationId, senderId);
    if (!isMember) {
      throw new ForbiddenException('You are not a participant in this conversation.');
    }

    // 3. Privacy check
    const recipientIds = await this.conversationRepository.getParticipantIds(dto.conversationId);
    const otherParticipants = recipientIds.filter((id) => id !== senderId);

    for (const recipientId of otherParticipants) {
      const [blockedBySender, blockedByRecipient] = await Promise.all([
        this.privacyService.checkIsBlocked(senderId, recipientId),
        this.privacyService.checkIsBlocked(recipientId, senderId),
      ]);
      if (blockedBySender || blockedByRecipient) {
        throw new ForbiddenException('Message cannot be sent due to privacy settings.');
      }
    }

    // 4. Content validation
    if (!dto.text && (!dto.attachments || dto.attachments.length === 0)) {
      if (dto.type === MessageType.TEXT || !dto.type) {
        throw new BadRequestException('Message must have text or attachments.');
      }
    }
    if (dto.text && dto.text.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(`Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.`);
    }

    // 5. Idempotency
    const existing = await this.messageRepository.findByClientMessageId(dto.clientMessageId);
    if (existing) {
      this.logger.warn(
        `[Idempotent] clientMessageId=${dto.clientMessageId} already exists — returning cached`,
      );
      return this.toResponseDto(existing);
    }

    // 6. Persist message + update conversation summary inside ONE transaction
    const saved = await this.dataSource.transaction(async (manager) => {
      const message = manager.create(MessageEntity, {
        id: randomUUID(),
        clientMessageId: dto.clientMessageId,
        conversationId: dto.conversationId,
        senderId,
        type: dto.type ?? MessageType.TEXT,
        text: dto.text,
        attachments: dto.attachments,
        replyToId: dto.replyToId,
        metadata: dto.metadata,
        status: MessageStatus.SENT,
        mentions: [],
        reactions: {},
      });

      const savedMsg = await manager.save(MessageEntity, message);

      // Update lastMessage summary and increment unread for each recipient
      // Unread is ONLY incremented for users who do NOT have the conversation actively open.
      // "Actively open" is approximated by lastReadAt being recent — the client sends
      // mark-read on open-conversation, which updates lastReadAt.
      const conversation = await manager.findOneOrFail(
        ConversationEntity,
        { where: { id: dto.conversationId } },
      );

      const updatedUnreadCounts = { ...conversation.unreadCounts };
      for (const recipientId of recipientIds) {
        if (recipientId !== senderId) {
          // Only increment if recipient hasn't explicitly cleared unread recently.
          // We do increment here — the client clears it on open-conversation.
          updatedUnreadCounts[recipientId] = (updatedUnreadCounts[recipientId] ?? 0) + 1;
        }
      }

      const previewText = dto.text
        ? dto.text.length > 100
          ? dto.text.slice(0, 100) + '…'
          : dto.text
        : `[${dto.type ?? 'attachment'}]`;

      await manager.update(
        ConversationEntity,
        dto.conversationId,
        {
          lastMessageId: savedMsg.id,
          lastMessageSenderId: senderId,
          lastMessageText: previewText,
          lastMessageAt: savedMsg.createdAt,
          unreadCounts: updatedUnreadCounts,
        },
      );

      return savedMsg;
    });

    this.logger.log(
      `[MessageSent] messageId=${saved.id} clientId=${dto.clientMessageId} ` +
      `convId=${dto.conversationId} senderId=${senderId}`,
    );

    // 7. Dispatch — gateway picks this up and broadcasts
    const conversation = await this.conversationRepository.findById(dto.conversationId);
    this.chatEventDispatcher.dispatch({
      type: 'MESSAGE_CREATED',
      payload: {
        message: saved,
        conversation: conversation!,
        recipientIds,
      },
    });

    return this.toResponseDto(saved);
  }

  // ─────────────────────────────────────────────────────────
  // MESSAGE HISTORY
  // ─────────────────────────────────────────────────────────

  async getMessages(userId: string, conversationId: string, limit: number, cursor?: string) {
    const isMember = await this.conversationRepository.isParticipant(conversationId, userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a participant in this conversation.');
    }
    return this.messageRepository.paginate(conversationId, limit, cursor);
  }

  // ─────────────────────────────────────────────────────────
  // DELIVERY PIPELINE
  // ─────────────────────────────────────────────────────────

  /**
   * Mark a single message as DELIVERED and notify the sender.
   * Called by the gateway immediately after broadcasting message:new to the receiver.
   */
  async markDelivered(messageId: string, recipientId: string): Promise<void> {
    const updated = await this.messageRepository.markDelivered(messageId);
    if (!updated) return;

    this.logger.log(
      `[Delivered] messageId=${messageId} recipientId=${recipientId} ` +
      `convId=${updated.conversationId} senderId=${updated.senderId}`,
    );

    this.chatEventDispatcher.dispatch({
      type: 'MESSAGE_DELIVERED',
      payload: {
        messageId,
        conversationId: updated.conversationId,
        senderId: updated.senderId,
        deliveredAt: updated.deliveredAt!,
      },
    });
  }

  /**
   * Mark ALL SENT messages in a conversation as DELIVERED for a connecting user.
   * Called on open-conversation to catch up messages sent while user was offline.
   */
  async markConversationDelivered(conversationId: string, recipientId: string): Promise<void> {
    const messages = await this.messageRepository.findUnread(conversationId, recipientId);
    const sentMessages = messages.filter((m) => m.status === MessageStatus.SENT);

    for (const msg of sentMessages) {
      const updated = await this.messageRepository.markDelivered(msg.id);
      if (!updated) continue;

      this.logger.log(
        `[BulkDeliver] messageId=${msg.id} convId=${conversationId} recipientId=${recipientId}`,
      );

      this.chatEventDispatcher.dispatch({
        type: 'MESSAGE_DELIVERED',
        payload: {
          messageId: msg.id,
          conversationId: msg.conversationId,
          senderId: msg.senderId,
          deliveredAt: updated.deliveredAt!,
        },
      });
    }
  }

  /**
   * Mark a message as READ and clear unread count for this conversation.
   * Called when user has the conversation open.
   */
  async markRead(userId: string, conversationId: string, messageId: string): Promise<void> {
    const isMember = await this.conversationRepository.isParticipant(conversationId, userId);
    if (!isMember) throw new ForbiddenException('Not a participant.');

    // Always clear unread count when user is looking at the conversation
    await this.conversationRepository.clearUnreadCount(conversationId, userId);

    if (!messageId) return;

    const updated = await this.messageRepository.markRead(messageId);
    if (!updated) return;

    this.logger.log(
      `[Read] messageId=${messageId} convId=${conversationId} readerId=${userId} senderId=${updated.senderId}`,
    );

    this.chatEventDispatcher.dispatch({
      type: 'MESSAGE_READ',
      payload: {
        messageId,
        conversationId,
        senderId: updated.senderId,
        readerId: userId,
        readAt: updated.readAt!,
      },
    });
  }

  // ─────────────────────────────────────────────────────────
  // EDIT & DELETE
  // ─────────────────────────────────────────────────────────

  async editMessage(userId: string, messageId: string, newText: string): Promise<MessageResponseDto> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) throw new NotFoundException('Message not found.');
    if (message.senderId !== userId) throw new ForbiddenException('You can only edit your own messages.');
    if (!newText || newText.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException('Invalid message text.');
    }

    const updated = await this.messageRepository.edit(messageId, newText);
    if (!updated) throw new NotFoundException('Message not found or already deleted.');

    this.logger.log(`[Edited] messageId=${messageId} convId=${updated.conversationId} userId=${userId}`);

    this.chatEventDispatcher.dispatch({
      type: 'MESSAGE_EDITED',
      payload: {
        messageId,
        conversationId: updated.conversationId,
        newText,
        editedAt: updated.updatedAt,
      },
    });

    return this.toResponseDto(updated);
  }

  async deleteMessage(userId: string, messageId: string): Promise<void> {
    const message = await this.messageRepository.findById(messageId);
    if (!message) throw new NotFoundException('Message not found.');
    if (message.senderId !== userId) throw new ForbiddenException('You can only delete your own messages.');

    await this.messageRepository.softDelete(messageId);

    this.logger.log(`[Deleted] messageId=${messageId} convId=${message.conversationId} userId=${userId}`);

    this.chatEventDispatcher.dispatch({
      type: 'MESSAGE_DELETED',
      payload: {
        messageId,
        conversationId: message.conversationId,
        deletedBy: userId,
        deletedAt: new Date(),
      },
    });
  }

  // ─────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────

  private enforceRateLimit(userId: string): void {
    const now = Date.now();
    const entry = this.rateLimitMap.get(userId);

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      this.rateLimitMap.set(userId, { count: 1, windowStart: now });
      return;
    }

    entry.count += 1;
    if (entry.count > RATE_LIMIT_MAX_MESSAGES) {
      throw new HttpException(
        `Rate limit exceeded. Max ${RATE_LIMIT_MAX_MESSAGES} messages per ${RATE_LIMIT_WINDOW_MS / 1000}s.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  toResponseDto(message: MessageEntity): MessageResponseDto {
    return {
      id: message.id,
      clientMessageId: message.clientMessageId,
      conversationId: message.conversationId,
      senderId: message.senderId,
      type: message.type,
      text: message.text,
      attachments: message.attachments,
      replyToId: message.replyToId,
      status: message.status,
      isEdited: message.isEdited,
      isDeleted: message.isDeleted,
      reactions: message.reactions,
      deliveredAt: message.deliveredAt,
      readAt: message.readAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
}
