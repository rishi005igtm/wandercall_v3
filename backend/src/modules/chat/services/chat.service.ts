import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MessageEntity, MessageStatus, MessageType } from '../entities/message.entity';
import { MessageRepository } from '../repositories/message.repository';
import { ConversationRepository } from '../repositories/conversation.repository';
import { ChatEventDispatcher } from './chat-event.dispatcher';
import { PresenceService } from './presence.service';
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
 * ChatService — The core business logic layer for messaging.
 *
 * RULES:
 * - Never directly manipulates TypeORM repositories — uses repository layer exclusively
 * - Never emits socket events directly — delegates to the gateway via event dispatcher
 * - Never contains socket.io references
 * - Each method is independently testable
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  /**
   * In-memory rate limiter: Map<userId, { count: number, windowStart: number }>
   * Future: replace with Redis INCR + EXPIRE for distributed rate limiting
   */
  private readonly rateLimitMap = new Map<string, { count: number; windowStart: number }>();

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly chatEventDispatcher: ChatEventDispatcher,
    private readonly presenceService: PresenceService,
    private readonly privacyService: PrivacyService,
    private readonly userRepository: UserRepository,
  ) {}

  // ─────────────────────────────────────────────────────────
  // CONVERSATION MANAGEMENT
  // ─────────────────────────────────────────────────────────

  /**
   * Get or create a direct conversation between two users.
   * Validates that users are mutual follows (friends) before allowing chat.
   */
  async getOrCreateDirectConversation(requesterId: string, targetUserId: string): Promise<{ conversationId: string }> {
    if (requesterId === targetUserId) {
      throw new BadRequestException('Cannot start a conversation with yourself.');
    }

    // Privacy check: both directions
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

    this.logger.log(`Conversation ${conversation.id} resolved for users ${requesterId} ↔ ${targetUserId}`);
    return { conversationId: conversation.id };
  }

  /**
   * Get all conversations for a user with the unread count for that user.
   */
  async getConversations(userId: string) {
    const conversations = await this.conversationRepository.findByUserId(userId);
    const participantIds = new Set<string>();

    for (const conv of conversations) {
      const ids = await this.conversationRepository.getParticipantIds(conv.id);
      ids.forEach((id) => participantIds.add(id));
    }

    // Fetch all participant profiles in one query
    const profiles = await Promise.all(
      [...participantIds].map((id) => this.userRepository.findByUserId(id)),
    );
    const profileMap = new Map(profiles.filter(Boolean).map((p) => [p!.userId, p!]));

    return conversations.map((conv) => ({
      ...conv,
      unreadCount: conv.unreadCounts[userId] ?? 0,
    }));
  }

  // ─────────────────────────────────────────────────────────
  // MESSAGE SENDING
  // ─────────────────────────────────────────────────────────

  /**
   * Full message send pipeline:
   * 1. Rate limit check
   * 2. Conversation membership validation
   * 3. Privacy validation (block check)
   * 4. Message content validation
   * 5. Idempotency check (clientMessageId)
   * 6. Persist message
   * 7. Update conversation summary
   * 8. Dispatch MESSAGE_CREATED event (socket gateway consumes this)
   */
  async sendMessage(senderId: string, dto: SendMessageDto): Promise<MessageResponseDto> {
    // 1. Rate limiting
    this.enforceRateLimit(senderId);

    // 2. Validate conversation membership
    const isMember = await this.conversationRepository.isParticipant(
      dto.conversationId,
      senderId,
    );
    if (!isMember) {
      throw new ForbiddenException('You are not a participant in this conversation.');
    }

    // 3. Privacy validation
    const recipientIds = await this.conversationRepository.getParticipantIds(dto.conversationId);
    const otherParticipants = recipientIds.filter((id) => id !== senderId);

    for (const recipientId of otherParticipants) {
      const [senderBlockedByRecipient, recipientBlockedBySender] = await Promise.all([
        this.privacyService.checkIsBlocked(recipientId, senderId),
        this.privacyService.checkIsBlocked(senderId, recipientId),
      ]);
      if (senderBlockedByRecipient || recipientBlockedBySender) {
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

    // 5. Idempotency — return existing message if clientMessageId already exists
    const existing = await this.messageRepository.findByClientMessageId(dto.clientMessageId);
    if (existing) {
      this.logger.warn(`Duplicate message detected for clientMessageId ${dto.clientMessageId} — returning existing message`);
      return this.toResponseDto(existing);
    }

    // 6. Persist message
    const message = new MessageEntity({
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

    const saved = await this.messageRepository.save(message);
    this.logger.log(`Message ${saved.id} persisted in conversation ${dto.conversationId} by ${senderId}`);

    // 7. Update conversation summary
    const conversation = await this.conversationRepository.findById(dto.conversationId);
    await this.conversationRepository.updateLastMessage(
      dto.conversationId,
      saved.id,
      senderId,
      dto.text ?? `[${dto.type ?? 'attachment'}]`,
      saved.createdAt,
      recipientIds,
    );

    // 8. Dispatch event — the ChatGateway listens and emits to sockets
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
  // DELIVERY & READ RECEIPTS
  // ─────────────────────────────────────────────────────────

  async markDelivered(messageId: string, recipientId: string): Promise<void> {
    const updated = await this.messageRepository.markDelivered(messageId);
    if (!updated) return;

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

  async markRead(userId: string, conversationId: string, messageId: string): Promise<void> {
    const isMember = await this.conversationRepository.isParticipant(conversationId, userId);
    if (!isMember) throw new ForbiddenException('Not a participant.');

    // Clear unread count regardless of specific messageId
    await this.conversationRepository.clearUnreadCount(conversationId, userId);

    // Only update the specific message if a real messageId was provided
    if (!messageId) return;

    const updated = await this.messageRepository.markRead(messageId);
    if (!updated) return;

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
  // PRIVATE HELPERS
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
        `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX_MESSAGES} messages per ${RATE_LIMIT_WINDOW_MS / 1000} seconds.`,
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
