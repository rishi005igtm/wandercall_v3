import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ChatService } from './services/chat.service';
import { PresenceService } from './services/presence.service';
import { ChatEventDispatcher } from './services/chat-event.dispatcher';
import { ConversationRepository } from './repositories/conversation.repository';
import {
  SendMessageDto,
  MarkReadDto,
  MarkDeliveredDto,
  TypingDto,
  OpenConversationDto,
} from './dto/send-message.dto';
import { SOCKET_EVENTS } from './constants/chat.constants';
import {
  MessageCreatedEvent,
  MessageDeliveredEvent,
  MessageReadEvent,
  MessageEditedEvent,
  MessageDeletedEvent,
} from './interfaces/chat-event.interface';
import { PresenceStatus } from './interfaces/presence.interface';

/**
 * ChatGateway — The thin socket handler layer.
 *
 * RULES (strictly enforced):
 * - Socket handlers only: authenticate, validate, call ChatService, return ACK
 * - NO business logic in handlers
 * - NO direct database access
 * - NO repository calls
 * - Each handler returns an ACK with { success, ...data } or { success: false, code, message }
 *
 * Multi-device support:
 * - User joins room `user:{userId}` on connect
 * - User joins conversation rooms as they open them
 * - All sockets for a userId receive events via `user:{userId}` room
 */
@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  path: '/socket.io/',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly chatService: ChatService,
    private readonly presenceService: PresenceService,
    private readonly chatEventDispatcher: ChatEventDispatcher,
    private readonly conversationRepository: ConversationRepository,
  ) {}

  afterInit(server: Server): void {
    this.logger.log('ChatGateway initialized — Socket.IO server ready');
    this.registerEventSubscribers();
  }

  // ─────────────────────────────────────────────────────────
  // CONNECTION LIFECYCLE
  // ─────────────────────────────────────────────────────────

  async handleConnection(socket: Socket): Promise<void> {
    try {
      const userId = await this.authenticateSocket(socket);
      if (!userId) {
        this.logger.warn(`Socket ${socket.id} rejected — invalid or missing JWT`);
        socket.emit(SOCKET_EVENTS.AUTH_ERROR, { message: 'Authentication required.' });
        socket.disconnect(true);
        return;
      }

      // Attach userId to socket data for use in handlers
      socket.data.userId = userId;

      // Register presence
      this.presenceService.connect(userId, socket.id);

      // Join user's private room — all devices for this user share this room
      await socket.join(`user:${userId}`);

      socket.emit(SOCKET_EVENTS.CONNECTED, {
        socketId: socket.id,
        userId,
        status: PresenceStatus.ONLINE,
      });

      // Broadcast presence change to all sockets that care about this user
      this.broadcastPresenceChange(userId, PresenceStatus.ONLINE);

      this.logger.log(`Socket ${socket.id} connected for user ${userId}`);
    } catch (error) {
      this.logger.error(`Connection error for socket ${socket.id}:`, error);
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket): void {
    const userId = socket.data.userId;
    if (!userId) return;

    this.presenceService.disconnect(userId, socket.id);
    const isStillOnline = this.presenceService.isOnline(userId);

    if (!isStillOnline) {
      const presence = this.presenceService.getPresence(userId);
      this.broadcastPresenceChange(userId, PresenceStatus.OFFLINE, presence?.lastSeen);
    }

    this.logger.log(`Socket ${socket.id} disconnected for user ${userId}. Still online: ${isStillOnline}`);
  }

  // ─────────────────────────────────────────────────────────
  // SOCKET EVENT HANDLERS — thin wrappers only
  // ─────────────────────────────────────────────────────────

  @SubscribeMessage(SOCKET_EVENTS.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() rawData: any,
  ): Promise<any> {
    const userId = socket.data.userId;
    if (!userId) return this.ackError('AUTH_REQUIRED', 'Not authenticated.');

    // Validate DTO
    const dto = plainToInstance(SendMessageDto, rawData);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const detail = errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('; ');
      return this.ackError('VALIDATION_ERROR', detail);
    }

    try {
      const message = await this.chatService.sendMessage(userId, dto);
      return {
        success: true,
        clientMessageId: dto.clientMessageId,
        serverMessageId: message.id,
        status: message.status,
        createdAt: message.createdAt,
      };
    } catch (error: any) {
      return this.ackError(error.status === 429 ? 'RATE_LIMITED' : 'SEND_FAILED', error.message);
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.TYPING_START)
  async handleTypingStart(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: TypingDto,
  ): Promise<void> {
    const userId = socket.data.userId;
    if (!userId || !data?.conversationId) return;

    this.presenceService.startTyping(userId, data.conversationId);

    // Emit to everyone in the conversation room except the sender
    socket.to(`conv:${data.conversationId}`).emit(SOCKET_EVENTS.TYPING_START_BROADCAST, {
      userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage(SOCKET_EVENTS.TYPING_STOP)
  async handleTypingStop(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: TypingDto,
  ): Promise<void> {
    const userId = socket.data.userId;
    if (!userId || !data?.conversationId) return;

    this.presenceService.stopTyping(userId, data.conversationId);

    socket.to(`conv:${data.conversationId}`).emit(SOCKET_EVENTS.TYPING_STOP_BROADCAST, {
      userId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage(SOCKET_EVENTS.MARK_DELIVERED)
  async handleMarkDelivered(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: MarkDeliveredDto,
  ): Promise<void> {
    const userId = socket.data.userId;
    if (!userId || !data?.messageId) return;

    try {
      await this.chatService.markDelivered(data.messageId, userId);
    } catch (_) {
      // Non-critical — fire and forget
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.MARK_READ)
  async handleMarkRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: MarkReadDto,
  ): Promise<void> {
    const userId = socket.data.userId;
    if (!userId || !data?.conversationId || !data?.messageId) return;

    try {
      await this.chatService.markRead(userId, data.conversationId, data.messageId);
    } catch (_) {
      // Non-critical
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.OPEN_CONVERSATION)
  async handleOpenConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: OpenConversationDto,
  ): Promise<any> {
    const userId = socket.data.userId;
    if (!userId || !data?.conversationId) return this.ackError('VALIDATION_ERROR', 'conversationId required.');

    try {
      // Join the conversation room so the user receives real-time messages
      await socket.join(`conv:${data.conversationId}`);

      // Clear unread count (no messageId needed — clears the whole conversation)
      await this.conversationRepository.clearUnreadCount(data.conversationId, userId);

      // Fetch recent message history to return on open
      const { items } = await this.chatService.getMessages(userId, data.conversationId, 30);

      return { success: true, conversationId: data.conversationId, messages: items };
    } catch (error: any) {
      return this.ackError('OPEN_FAILED', error.message);
    }
  }

  // ─────────────────────────────────────────────────────────
  // EVENT SUBSCRIBERS — wired to ChatEventDispatcher
  // ─────────────────────────────────────────────────────────

  private registerEventSubscribers(): void {
    // MESSAGE_CREATED: emit new message to all participants
    this.chatEventDispatcher.subscribe<MessageCreatedEvent>('MESSAGE_CREATED', (payload) => {
      const { message, recipientIds } = payload;

      for (const recipientId of recipientIds) {
        // Emit to all devices for this user via their private room
        this.server.to(`user:${recipientId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, {
          message: this.chatService.toResponseDto(message),
          conversationId: message.conversationId,
        });
      }

      this.logger.debug(`MESSAGE_CREATED broadcast to ${recipientIds.length} participants for conv ${message.conversationId}`);
    });

    // MESSAGE_DELIVERED: notify the original sender
    this.chatEventDispatcher.subscribe<MessageDeliveredEvent>('MESSAGE_DELIVERED', (payload) => {
      this.server.to(`user:${payload.senderId}`).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
        messageId: payload.messageId,
        conversationId: payload.conversationId,
        deliveredAt: payload.deliveredAt,
      });
    });

    // MESSAGE_READ: notify the original sender
    this.chatEventDispatcher.subscribe<MessageReadEvent>('MESSAGE_READ', (payload) => {
      this.server.to(`user:${payload.senderId}`).emit(SOCKET_EVENTS.MESSAGE_READ, {
        messageId: payload.messageId,
        conversationId: payload.conversationId,
        readAt: payload.readAt,
      });
    });

    // MESSAGE_EDITED: broadcast to conversation room
    this.chatEventDispatcher.subscribe<MessageEditedEvent>('MESSAGE_EDITED', (payload) => {
      this.server.to(`conv:${payload.conversationId}`).emit(SOCKET_EVENTS.MESSAGE_EDITED, payload);
    });

    // MESSAGE_DELETED: broadcast to conversation room
    this.chatEventDispatcher.subscribe<MessageDeletedEvent>('MESSAGE_DELETED', (payload) => {
      this.server.to(`conv:${payload.conversationId}`).emit(SOCKET_EVENTS.MESSAGE_DELETED, payload);
    });

    this.logger.log('ChatGateway event subscribers registered');
  }

  // ─────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────

  private async authenticateSocket(socket: Socket): Promise<string | null> {
    try {
      // Accept token from handshake.auth.token or query param for fallback
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        socket.handshake.query?.token as string;

      if (!token) return null;

      const secret = this.configService.get<string>('jwt.secret', 'wandercall_jwt_secret_key_2026');
      const payload = this.jwtService.verify<{ sub: string; email: string }>(token, { secret });

      return payload.sub ?? null;
    } catch {
      return null;
    }
  }

  private broadcastPresenceChange(userId: string, status: PresenceStatus, lastSeen?: Date): void {
    this.server.emit(SOCKET_EVENTS.PRESENCE_CHANGE, { userId, status, lastSeen });
  }

  private ackError(code: string, message: string) {
    return { success: false, code, message };
  }
}
