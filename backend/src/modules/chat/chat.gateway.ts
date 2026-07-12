import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ChatService } from './services/chat.service';
import { CommunityChatService } from './services/community-chat.service';
import { PresenceService } from './services/presence.service';
import { ChatEventDispatcher } from './services/chat-event.dispatcher';
import { CommunityEventDispatcher, CommunityEvents } from '../community/events/community-event.dispatcher';
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
 * ChatGateway — Thin socket handler layer.
 *
 * Rules:
 * - Handlers only: authenticate → validate → call service → return ACK
 * - NO business logic, NO raw DB queries, NO repository calls
 * - All events return typed ACKs: { success, ...data } or { success: false, code, message }
 *
 * Delivery lifecycle managed here:
 * - After broadcasting message:new, the gateway immediately dispatches MESSAGE_DELIVERED
 *   for all recipients who are currently online (their socket exists in the room).
 *   This closes the SENT → DELIVERED gap when both users are online simultaneously.
 */
@Injectable()
@WebSocketGateway({
  cors: { origin: true, credentials: true },
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
    private readonly communityChatService: CommunityChatService,
    private readonly presenceService: PresenceService,
    private readonly chatEventDispatcher: ChatEventDispatcher,
    @Inject(forwardRef(() => CommunityEventDispatcher))
    private readonly communityEventDispatcher: CommunityEventDispatcher,
    private readonly conversationRepository: ConversationRepository,
  ) {}

  afterInit(_server: Server): void {
    this.registerEventSubscribers();
  }

  // ─────────────────────────────────────────────────────────
  // CONNECTION LIFECYCLE
  // ─────────────────────────────────────────────────────────

  async handleConnection(socket: Socket): Promise<void> {
    const userId = await this.authenticateSocket(socket);

    if (!userId) {
      this.logger.warn(`Socket ${socket.id} rejected — invalid or missing JWT`);
      socket.emit(SOCKET_EVENTS.AUTH_ERROR, { message: 'Authentication required.' });
      socket.disconnect(true);
      return;
    }

    socket.data.userId = userId;
    this.presenceService.connect(userId, socket.id);
    await socket.join(`user:${userId}`);

    socket.emit(SOCKET_EVENTS.CONNECTED, { socketId: socket.id, userId, status: PresenceStatus.ONLINE });

    // Notify only users who share a conversation with this user, not ALL sockets globally.
    // For now we broadcast to the server room for this user — presence is lightweight.
    this.server.to(`user:${userId}`).emit(SOCKET_EVENTS.PRESENCE_CHANGE, {
      userId,
      status: PresenceStatus.ONLINE,
    });

    this.chatEventDispatcher.dispatchUserConnected(userId, socket.id);
  }

  handleDisconnect(socket: Socket): void {
    const userId = socket.data.userId;
    if (!userId) return;

    this.presenceService.disconnect(userId, socket.id);
    const isStillOnline = this.presenceService.isOnline(userId);
    
    this.chatEventDispatcher.dispatchUserDisconnected(userId, socket.id, isStillOnline);

    if (!isStillOnline) {
      const presence = this.presenceService.getPresence(userId);
      this.server.to(`user:${userId}`).emit(SOCKET_EVENTS.PRESENCE_CHANGE, {
        userId,
        status: PresenceStatus.OFFLINE,
        lastSeen: presence?.lastSeen,
      });
    }
  }

  // ─────────────────────────────────────────────────────────
  // SOCKET EVENT HANDLERS
  // ─────────────────────────────────────────────────────────

  @SubscribeMessage(SOCKET_EVENTS.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() rawData: any,
  ): Promise<any> {
    const userId = socket.data.userId;
    if (!userId) return this.ackError('AUTH_REQUIRED', 'Not authenticated.');

    const dto = plainToInstance(SendMessageDto, rawData);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const detail = errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('; ');
      this.logger.warn(`[SendMsg:Invalid] socketId=${socket.id} userId=${userId} errors=${detail}`);
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
      this.logger.error(`[SendMsg:Fail] socketId=${socket.id} error=${error.message}`);
      return this.ackError(error.status === 429 ? 'RATE_LIMITED' : 'SEND_FAILED', error.message);
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.TYPING_START)
  handleTypingStart(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: TypingDto,
  ): any {
    const userId = socket.data.userId;
    if (!userId || !data?.conversationId) return { success: false };

    this.presenceService.startTyping(userId, data.conversationId);
    socket.to(`conv:${data.conversationId}`).emit(SOCKET_EVENTS.TYPING_START_BROADCAST, {
      userId,
      conversationId: data.conversationId,
    });
    return { success: true };
  }

  @SubscribeMessage(SOCKET_EVENTS.TYPING_STOP)
  handleTypingStop(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: TypingDto,
  ): any {
    const userId = socket.data.userId;
    if (!userId || !data?.conversationId) return { success: false };

    this.presenceService.stopTyping(userId, data.conversationId);
    socket.to(`conv:${data.conversationId}`).emit(SOCKET_EVENTS.TYPING_STOP_BROADCAST, {
      userId,
      conversationId: data.conversationId,
    });
    return { success: true };
  }

  @SubscribeMessage(SOCKET_EVENTS.MARK_DELIVERED)
  async handleMarkDelivered(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: MarkDeliveredDto,
  ): Promise<any> {
    const userId = socket.data.userId;
    if (!userId || !data?.messageId) return { success: false };
    try {
      await this.chatService.markDelivered(data.messageId, userId);
    } catch (_) { /* non-critical */ }
    return { success: true };
  }

  @SubscribeMessage(SOCKET_EVENTS.MARK_READ)
  async handleMarkRead(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: MarkReadDto,
  ): Promise<any> {
    const userId = socket.data.userId;
    if (!userId || !data?.conversationId) return { success: false };
    try {
      if (data.messageId) {
        await this.chatService.markRead(userId, data.conversationId, data.messageId);
      } else {
        await this.conversationRepository.clearUnreadCount(data.conversationId, userId);
        this.server.to(`user:${userId}`).emit('conversation:updated', { conversationId: data.conversationId });
      }
    } catch (_) { /* non-critical */ }
    return { success: true };
  }

  @SubscribeMessage(SOCKET_EVENTS.OPEN_CONVERSATION)
  async handleOpenConversation(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: OpenConversationDto,
  ): Promise<any> {
    const userId = socket.data.userId;
    if (!userId || !data?.conversationId) {
      return this.ackError('VALIDATION_ERROR', 'conversationId required.');
    }

    try {
      // 1. Join the socket room so receiver gets future messages in real-time
      await socket.join(`conv:${data.conversationId}`);

      // 2. Clear unread count and update lastReadAt
      await this.conversationRepository.clearUnreadCount(data.conversationId, userId);
      
      // Notify the user's sockets to update conversation list (e.g. unread count to 0)
      this.server.to(`user:${userId}`).emit('conversation:updated', { conversationId: data.conversationId });

      // 3. Bulk-deliver any SENT messages the user hasn't received yet
      await this.chatService.markConversationDelivered(data.conversationId, userId);

      // 4. Load recent history
      const { items } = await this.chatService.getMessages(userId, data.conversationId, 30);

      return { success: true, conversationId: data.conversationId, messages: items };
    } catch (error: any) {
      this.logger.error(`[OpenConv:Fail] convId=${data.conversationId} userId=${userId} error=${error.message}`);
      return this.ackError('OPEN_FAILED', error.message);
    }
  }

  // ─────────────────────────────────────────────────────────
  // COMMUNITY CHAT EVENT HANDLERS
  // ─────────────────────────────────────────────────────────

  @SubscribeMessage('join_community')
  async handleJoinCommunity(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { communityId: string },
  ): Promise<any> {
    const userId = socket.data.userId;
    if (!userId || !data?.communityId) return this.ackError('VALIDATION_ERROR', 'communityId required.');

    try {
      await socket.join(`room:community:${data.communityId}`);
      await socket.join(`community:${data.communityId}`);
      return { success: true };
    } catch (error: any) {
      return this.ackError('JOIN_FAILED', error.message);
    }
  }

  @SubscribeMessage('leave_community')
  async handleLeaveCommunity(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { communityId: string },
  ): Promise<any> {
    const userId = socket.data.userId;
    if (!userId || !data?.communityId) return this.ackError('VALIDATION_ERROR', 'communityId required.');

    try {
      await socket.leave(`room:community:${data.communityId}`);
      await socket.leave(`community:${data.communityId}`);
      return { success: true };
    } catch (error: any) {
      return this.ackError('LEAVE_FAILED', error.message);
    }
  }

  @SubscribeMessage('community:send_message')
  async handleCommunitySendMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() rawData: any,
  ): Promise<any> {
    const userId = socket.data.userId;
    if (!userId) return this.ackError('AUTH_REQUIRED', 'Not authenticated.');
    if (!rawData.communityId) return this.ackError('VALIDATION_ERROR', 'communityId required.');

    const dto = plainToInstance(SendMessageDto, rawData);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const detail = errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('; ');
      this.logger.error(`[CommSendMsg:ValidationFail] socketId=${socket.id} error=${detail} rawData=${JSON.stringify(rawData)}`);
      return this.ackError('VALIDATION_ERROR', detail);
    }

    try {
      const message = await this.communityChatService.sendMessage(userId, rawData.communityId, dto);
      return message;
    } catch (error: any) {
      this.logger.error(`[CommSendMsg:Fail] socketId=${socket.id} error=${error.message}`);
      return this.ackError(error.status === 429 ? 'RATE_LIMITED' : 'SEND_FAILED', error.message);
    }
  }

  @SubscribeMessage('community:join-lobby')
  async handleJoinLobby(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { communityId: string; user: any },
  ): Promise<any> {
    const userId = socket.data.userId;
    if (!userId || !data?.communityId) return { success: false };
    await socket.join(`community:${data.communityId}`);
    await socket.join(`room:community:${data.communityId}`);
    this.chatEventDispatcher.dispatch({
      type: 'COMMUNITY_JOIN_LOBBY' as any,
      payload: { communityId: data.communityId, userId, user: data.user, socketId: socket.id },
    });
    return { success: true };
  }

  @SubscribeMessage('community:leave-lobby')
  async handleLeaveLobby(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { communityId: string },
  ): Promise<any> {
    const userId = socket.data.userId;
    if (!userId || !data?.communityId) return { success: false };
    await socket.leave(`community:${data.communityId}`);
    await socket.leave(`room:community:${data.communityId}`);
    this.chatEventDispatcher.dispatch({
      type: 'COMMUNITY_LEAVE_LOBBY' as any,
      payload: { communityId: data.communityId, userId, socketId: socket.id },
    });
    return { success: true };
  }

  // ─────────────────────────────────────────────────────────
  // EVENT SUBSCRIBERS
  // ─────────────────────────────────────────────────────────

  private registerEventSubscribers(): void {
    /**
     * MESSAGE_CREATED
     *
     * Broadcast message to all participants via their private `user:{id}` room.
     * Using `user:` rooms (not `conv:`) ensures multi-device delivery —
     * every tab and device for a user receives the message even if they haven't
     * called open-conversation.
     *
     * Delivery lifecycle:
     * - Emit message:new to each recipient
     * - If the recipient is ONLINE (socket exists), immediately dispatch MESSAGE_DELIVERED
     *   server-side. This transitions status SENT → DELIVERED without requiring the
     *   client to explicitly emit mark-delivered.
     */
    this.chatEventDispatcher.subscribe<MessageCreatedEvent>('MESSAGE_CREATED', async (payload) => {
      const { message, recipientIds } = payload;

      for (const recipientId of recipientIds) {
        // Emit message:new to all devices of this participant
        this.server.to(`user:${recipientId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, {
          message: this.chatService.toResponseDto(message),
          conversationId: message.conversationId,
        });

        // Auto-deliver for RECIPIENTS (not the sender) who are online right now
        if (recipientId !== message.senderId && this.presenceService.isOnline(recipientId)) {
          try {
            await this.chatService.markDelivered(message.id, recipientId);
          } catch (_) { /* non-critical — status stays SENT if this fails */ }
        }
      }

    });

    /** MESSAGE_DELIVERED → notify the sender their message was received */
    this.chatEventDispatcher.subscribe<MessageDeliveredEvent>('MESSAGE_DELIVERED', (payload) => {
      this.server.to(`user:${payload.senderId}`).emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
        messageId: payload.messageId,
        conversationId: payload.conversationId,
        deliveredAt: payload.deliveredAt,
      });
    });

    /** MESSAGE_READ → notify the sender their message was read */
    this.chatEventDispatcher.subscribe<MessageReadEvent>('MESSAGE_READ', (payload) => {
      this.server.to(`user:${payload.senderId}`).emit(SOCKET_EVENTS.MESSAGE_READ, {
        messageId: payload.messageId,
        conversationId: payload.conversationId,
        readAt: payload.readAt,
      });
    });

    /** MESSAGE_EDITED → broadcast to all sockets in the conversation room */
    this.chatEventDispatcher.subscribe<MessageEditedEvent>('MESSAGE_EDITED', (payload) => {
      this.server.to(`conv:${payload.conversationId}`).emit(SOCKET_EVENTS.MESSAGE_EDITED, payload);
    });

    /** MESSAGE_DELETED → broadcast to all sockets in the conversation room */
    this.chatEventDispatcher.subscribe<MessageDeletedEvent>('MESSAGE_DELETED', (payload) => {
      this.server.to(`conv:${payload.conversationId}`).emit(SOCKET_EVENTS.MESSAGE_DELETED, payload);
    });

    /** COMMUNITY_MESSAGE_CREATED → broadcast to all sockets in the community room */
    this.chatEventDispatcher.subscribe<any>('COMMUNITY_MESSAGE_CREATED', (payload) => {
      const { communityId, message } = payload;
      this.server.to(`room:community:${communityId}`).to(`community:${communityId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, {
        message,
        conversationId: message.conversationId,
        communityId,
      });
    });

    this.communityEventDispatcher.on(CommunityEvents.MEMBER_MUTED, (payload: any) => {
      this.server.to(`room:community:${payload.communityId}`).to(`community:${payload.communityId}`).emit('community:moderation:action', { ...payload, action: 'MUTE' });
      this.server.emit('COMMUNITY_UPDATED', { communityId: payload.communityId });
    });
    this.communityEventDispatcher.on(CommunityEvents.MEMBER_UNMUTED, (payload: any) => {
      this.server.to(`room:community:${payload.communityId}`).to(`community:${payload.communityId}`).emit('community:moderation:action', { ...payload, action: 'UNMUTE' });
      this.server.emit('COMMUNITY_UPDATED', { communityId: payload.communityId });
    });
    this.communityEventDispatcher.on(CommunityEvents.MEMBER_BANNED, (payload: any) => {
      this.server.to(`room:community:${payload.communityId}`).to(`community:${payload.communityId}`).emit('community:moderation:action', { ...payload, action: 'BAN' });
      this.server.emit('COMMUNITY_UPDATED', { communityId: payload.communityId });
    });
    this.communityEventDispatcher.on(CommunityEvents.MEMBER_UNBANNED, (payload: any) => {
      this.server.to(`room:community:${payload.communityId}`).to(`community:${payload.communityId}`).emit('community:moderation:action', { ...payload, action: 'UNBAN' });
      this.server.emit('COMMUNITY_UPDATED', { communityId: payload.communityId });
    });
    this.communityEventDispatcher.on(CommunityEvents.MEMBER_WARNED, (payload: any) => {
      this.server.to(`room:community:${payload.communityId}`).to(`community:${payload.communityId}`).emit('community:moderation:action', { ...payload, action: 'WARN' });
      this.server.emit('COMMUNITY_UPDATED', { communityId: payload.communityId });
    });
    this.communityEventDispatcher.on(CommunityEvents.MEMBER_KICKED, (payload: any) => {
      this.server.to(`room:community:${payload.communityId}`).to(`community:${payload.communityId}`).emit('community:moderation:action', { ...payload, action: 'KICK' });
      this.server.emit('COMMUNITY_UPDATED', { communityId: payload.communityId });
    });
    this.communityEventDispatcher.on(CommunityEvents.ROLE_CHANGED, (payload: any) => {
      this.server.to(`room:community:${payload.communityId}`).to(`community:${payload.communityId}`).emit('community:role:updated', payload);
      this.server.emit('COMMUNITY_UPDATED', { communityId: payload.communityId });
    });
    this.communityEventDispatcher.on(CommunityEvents.SETTINGS_UPDATED, (payload: any) => {
      this.server.to(`room:community:${payload.communityId}`).to(`community:${payload.communityId}`).emit('community:settings:updated', payload);
      this.server.emit('COMMUNITY_UPDATED', { communityId: payload.communityId });
    });
    this.communityEventDispatcher.on(CommunityEvents.JOINED, (payload: any) => {
      this.server.to(`room:community:${payload.communityId}`).to(`community:${payload.communityId}`).emit('community:member:joined', payload);
      this.server.emit('COMMUNITY_UPDATED', { communityId: payload.communityId });
    });
    this.communityEventDispatcher.on(CommunityEvents.LEFT, (payload: any) => {
      this.server.to(`room:community:${payload.communityId}`).to(`community:${payload.communityId}`).emit('community:member:left', payload);
      this.server.emit('COMMUNITY_UPDATED', { communityId: payload.communityId });
    });
    this.communityEventDispatcher.on(CommunityEvents.OWNER_TRANSFERRED, (payload: any) => {
      this.server.to(`room:community:${payload.communityId}`).to(`community:${payload.communityId}`).emit('community:ownership:transferred', payload);
      this.server.emit('COMMUNITY_UPDATED', { communityId: payload.communityId });
    });
    this.communityEventDispatcher.on(CommunityEvents.UPDATED, (payload: any) => {
      this.server.to(`room:community:${payload.communityId}`).to(`community:${payload.communityId}`).emit('community:updated', payload);
      this.server.emit('COMMUNITY_UPDATED', { communityId: payload.communityId });
    });

  }

  // ─────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────

  private async authenticateSocket(socket: Socket): Promise<string | null> {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization as string | undefined)?.replace('Bearer ', '') ||
        (socket.handshake.query?.token as string);

      if (!token) return null;

      const secret = this.configService.get<string>('jwt.secret', 'wandercall_jwt_secret_key_2026');
      const payload = this.jwtService.verify<{ sub: string; email: string }>(token, { secret });
      return payload.sub ?? null;
    } catch {
      return null;
    }
  }

  private ackError(code: string, message: string) {
    return { success: false, code, message };
  }
}
