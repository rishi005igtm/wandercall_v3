import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { CampfireEventDispatcher, CampfireEvents, CampfireParticipantEventPayload } from '../events/campfire-event.dispatcher';
import { CampfirePresenceService } from '../services/campfire-presence.service';
import { CampfireChatService } from '../services/campfire-chat.service';
import { LivekitService } from '../services/livekit.service';

@WebSocketGateway({
  // REMOVED namespace: '/campfires' — now uses default '/' namespace like chat
  // This allows single socket connection for all features
  path: '/socket.io/',
  cors: { origin: true, credentials: true },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class CampfireGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(CampfireGateway.name);

  // Maps roomId -> Timeout to handle host grace period
  private hostDisconnectTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly eventDispatcher: CampfireEventDispatcher,
    private readonly presenceService: CampfirePresenceService,
    private readonly chatService: CampfireChatService,
    private readonly livekitService: LivekitService,
  ) {
    this.registerEventListeners();
  }

  private registerEventListeners() {
    this.eventDispatcher.on(CampfireEvents.CREATED, (campfire) => {
      this.server.emit('CAMPFIRE_CREATED', campfire);
      this.server.emit('DISCOVERY_FEED_UPDATED', { type: 'CREATED', data: campfire });
    });

    this.eventDispatcher.on(CampfireEvents.DELETED, (payload) => {
      this.server.emit('CAMPFIRE_DELETED', payload);
      this.server.emit('DISCOVERY_FEED_UPDATED', { type: 'DELETED', id: payload.id });
    });

    this.eventDispatcher.on(CampfireEvents.STARTED, (campfire) => {
      this.server.emit('CAMPFIRE_STARTED', campfire);
      this.server.emit('DISCOVERY_FEED_UPDATED', { type: 'STARTED', data: campfire });
    });

    this.eventDispatcher.on(CampfireEvents.ENDED, (campfire) => {
      this.server.emit('CAMPFIRE_ENDED', campfire);
      this.server.emit('DISCOVERY_FEED_UPDATED', { type: 'ENDED', data: campfire });
    });

    this.eventDispatcher.on(CampfireEvents.RESTARTED, (campfire) => {
      this.server.emit('CAMPFIRE_RESTARTED', campfire);
      this.server.emit('DISCOVERY_FEED_UPDATED', { type: 'RESTARTED', data: campfire });
    });

    this.eventDispatcher.on(CampfireEvents.PARTICIPANT_JOINED, (payload: CampfireParticipantEventPayload) => {
      this.server.to(payload.campfireId).emit('CAMPFIRE_PARTICIPANT_JOINED', payload);
    });

    this.eventDispatcher.on(CampfireEvents.PARTICIPANT_LEFT, (payload: CampfireParticipantEventPayload) => {
      this.server.to(payload.campfireId).emit('CAMPFIRE_PARTICIPANT_LEFT', payload);
    });
  }

  afterInit(server: Server) {
  }

  handleConnection(client: Socket) {
    client.data = { userId: null, roomId: null, userProfile: null };
  }

  // In-memory map to track room participants for presence
  private roomParticipants = new Map<string, Set<string>>();

  async handleDisconnect(client: Socket) {
    
    const { roomId, userId, userProfile } = client.data || {};
    if (roomId && userId) {
      await this.presenceService.registerParticipantLeave(roomId, userId, client.id);
      const snapshot = await this.presenceService.getRoomPresenceSnapshot(roomId, userProfile?.hostId);
      this.server.to(roomId).emit('room_presence_snapshot', snapshot);
      
      if (userId === userProfile?.hostId) {
        const timeout = setTimeout(async () => {
          await this.livekitService.endLiveSession(roomId);
          this.hostDisconnectTimeouts.delete(roomId);
        }, 60000);
        this.hostDisconnectTimeouts.set(roomId, timeout);
      }
    }

    // Cleanup client from all rooms
    this.roomParticipants.forEach((participants, rId) => {
      if (participants.has(client.id)) {
        participants.delete(client.id);
        this.server.to(rId).emit('user_left', { userId: userId || client.id, socketId: client.id, userProfile });
        this.server.to(rId).emit('room_stats_update', { participantsCount: participants.size });
      }
    });
  }

  @SubscribeMessage('campfire:join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string; userProfile: any }
  ) {
    const { roomId, userId, userProfile } = data;
    
    let participants = this.roomParticipants.get(roomId);
    if (!participants) {
      participants = new Set<string>();
      this.roomParticipants.set(roomId, participants);
    }

    // Capacity check: Max 50 Listeners/Participants
    if (participants.size >= 50 && !participants.has(client.id)) {
      client.emit('room_error', { message: 'Campfire is at full capacity (50)' });
      return { success: false, error: 'Full capacity' };
    }

    participants.add(client.id);
    client.join(roomId);

    // Store identity in socket session
    client.data = { userId, roomId, userProfile };

    await this.presenceService.registerParticipantJoin(roomId, userId, userProfile, client.id);
    
    if (userId === userProfile?.hostId) {
      const existingTimeout = this.hostDisconnectTimeouts.get(roomId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        this.hostDisconnectTimeouts.delete(roomId);
      }
    }

    const snapshot = await this.presenceService.getRoomPresenceSnapshot(roomId, userProfile?.hostId);
    this.server.to(roomId).emit('room_presence_snapshot', snapshot);

    this.server.to(roomId).emit('user_joined', { userId: userId || client.id, socketId: client.id, userProfile });
    this.server.to(roomId).emit('room_stats_update', { participantsCount: participants.size });

    // Emit chat history to the newly joined client
    try {
      const history = await this.chatService.getChatHistory(roomId);
      client.emit('chat_history', history);
    } catch (e) {
      this.logger.error(`Error fetching chat history for room ${roomId}`);
    }

    // Emit seat snapshot
    try {
      const seats = await this.presenceService.getRoomSeatsSnapshot(roomId);
      client.emit('room_seats_snapshot', seats);
    } catch (e) {
      this.logger.error(`Error fetching seats snapshot for room ${roomId}`);
    }

    return { success: true, snapshot };
  }

  @SubscribeMessage('campfire:leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string; userProfile?: any }
  ) {
    const { roomId, userId } = data;
    
    const participants = this.roomParticipants.get(roomId);
    if (participants) {
      participants.delete(client.id);
      this.server.to(roomId).emit('user_left', { userId: userId || client.data?.userId || client.id, socketId: client.id, userProfile: client.data?.userProfile });
      this.server.to(roomId).emit('room_stats_update', { participantsCount: participants.size });
      
      const up = client.data?.userProfile || data.userProfile;
      if (userId === up?.hostId) {
        const timeout = setTimeout(async () => {
          await this.livekitService.endLiveSession(roomId);
          this.hostDisconnectTimeouts.delete(roomId);
        }, 60000);
        this.hostDisconnectTimeouts.set(roomId, timeout);
      }
    }

    if (client.data && client.data.roomId === roomId) {
      client.data.roomId = null;
    }

    await this.presenceService.registerParticipantLeave(roomId, userId, client.id);

    // After leaving, the auto-evict from seat already ran. We should broadcast a seat update to be safe, 
    // or just let clients handle the user's departure. For robustness, send full snapshot.
    try {
      const seats = await this.presenceService.getRoomSeatsSnapshot(roomId);
      this.server.to(roomId).emit('room_seats_snapshot', seats);
    } catch (e) {}

    const snapshot = await this.presenceService.getRoomPresenceSnapshot(roomId, client.data?.userProfile?.hostId);
    this.server.to(roomId).emit('room_presence_snapshot', snapshot);

    client.leave(roomId);
    return { success: true };
  }

  @SubscribeMessage('campfire:take_seat')
  async handleTakeSeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string; seatIndex: number; userProfile: any }
  ) {
    const { roomId, userId, seatIndex, userProfile } = data;
    const result = await this.presenceService.takeSeat(roomId, userId, seatIndex);
    
    if (result.success) {
      // Update LiveKit permissions dynamically FIRST before notifying frontend
      await this.livekitService.updateParticipantPermissions(roomId, userId, true);
      
      this.server.to(roomId).emit('seat_taken', { userId, seatIndex, userProfile });
      
      return { success: true };
    } else {
      client.emit('room_error', { message: result.error || 'Could not take seat' });
      return { success: false, error: result.error };
    }
  }

  @SubscribeMessage('campfire:leave_seat')
  async handleLeaveSeatEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string }
  ) {
    const { roomId, userId } = data;
    await this.presenceService.leaveSeat(roomId, userId);
    this.server.to(roomId).emit('seat_left', { userId });
    
    // Revoke LiveKit publish permission
    await this.livekitService.updateParticipantPermissions(roomId, userId, false);
    
    return { success: true };
  }

  @SubscribeMessage('campfire:update_profile')
  handleUpdateProfile(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string; userProfile: any }
  ) {
    const { roomId, userId, userProfile } = data;
    this.server.to(roomId).emit('profile_updated', { userId: client.id, userProfile });
  }

  @SubscribeMessage('campfire:send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; userId: string; userProfile: any; text: string }
  ) {
    const { roomId, userId, userProfile, text } = data;
    try {
      const savedMessage = await this.chatService.saveMessage(roomId, userId, userProfile, text);
      this.server.to(roomId).emit('campfire:new_message', {
        id: savedMessage.id,
        userId: savedMessage.senderId,
        userProfile: {
          name: savedMessage.senderName,
          avatar: savedMessage.senderAvatar,
          role: savedMessage.senderRole
        },
        text: savedMessage.text,
        time: savedMessage.createdAt
      });
    } catch (e) {
      this.logger.error(`Error saving message in room ${roomId}:`, e);
    }
  }

  @SubscribeMessage('campfire:send_reaction')
  handleSendReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; emoji: string }
  ) {
    const { roomId, emoji } = data;
    this.server.to(roomId).emit('campfire:new_reaction', { 
      userId: client.id, 
      emoji 
    });
  }

  @SubscribeMessage('campfire:heartbeat')
  handleHeartbeat(@ConnectedSocket() client: Socket) {
    // Basic keep-alive
    return { success: true };
  }
}
