import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CampfireService } from '../services/campfire.service';
import { CampfireEventDispatcher, CampfireEvents } from '../events/campfire-event.dispatcher';

@Injectable()
@WebSocketGateway({
  namespace: '/campfires',
  cors: { origin: true, credentials: true },
  transports: ['websocket', 'polling'],
  path: '/socket.io/',
})
export class CampfireGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CampfireGateway.name);

  // In-memory tracking of who is in which room
  // room_id -> array of connected socket ids
  private roomParticipants = new Map<string, Set<string>>();
  private socketUserRoomMap = new Map<string, { userId: string; roomId: string }>();

  constructor(
    private readonly campfireService: CampfireService,
    private readonly eventDispatcher: CampfireEventDispatcher,
  ) {}

  onModuleInit() {
    this.eventDispatcher.on(CampfireEvents.CREATED, (campfire) => {
      if (this.server) {
        this.server.emit('campfire:created', campfire);
      }
    });

    this.eventDispatcher.on(CampfireEvents.STARTED, (campfire) => {
      if (this.server) {
        this.server.emit('campfire:started', campfire);
        this.server.to(campfire.id).emit('room_started', campfire);
      }
    });

    this.eventDispatcher.on(CampfireEvents.CLOSED, (campfire) => {
      if (this.server) {
        this.server.emit('campfire:ended', campfire);
        this.server.to(campfire.id).emit('room_ended', campfire);
      }
    });

    this.eventDispatcher.on(CampfireEvents.UPDATED, (campfire) => {
      if (this.server) {
        this.server.emit('campfire:updated', campfire);
        this.server.to(campfire.id).emit('room_stats_update', campfire);
        this.server.to(campfire.id).emit('room_updated', campfire);
      }
    });

    this.eventDispatcher.on(CampfireEvents.DELETED, (payload) => {
      if (this.server) {
        this.server.emit('campfire:ended', { id: payload.campfireId, status: 'DELETED' });
        this.server.to(payload.campfireId).emit('room_ended', { roomId: payload.campfireId, reason: 'Campfire deleted' });
      }
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }


  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    await this.leaveAllRooms(client);
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userId: string; userProfile: any },
  ) {
    const { roomId, userId, userProfile } = payload;
    client.join(roomId);
    
    if (!this.roomParticipants.has(roomId)) {
      this.roomParticipants.set(roomId, new Set());
    }
    this.roomParticipants.get(roomId)!.add(client.id);

    if (userId) {
      await this.campfireService.recordJoin(roomId, userId);
      this.socketUserRoomMap.set(client.id, { userId, roomId });

      try {
        const campfire = await this.campfireService.findById(roomId);
        if (campfire) {
          if (campfire.hostId === userId) {
            if (campfire.status !== 'ACTIVE' && (campfire.status as string) !== 'LIVE') {
              await this.campfireService.start(roomId, userId);
            }
            await this.campfireService.updateParticipants(roomId, Math.max(1, (campfire.currentSpeakers || 0) + 1), campfire.currentListeners || 0);
          } else {
            await this.campfireService.updateParticipants(roomId, campfire.currentSpeakers || 0, Math.max(1, (campfire.currentListeners || 0) + 1));
          }
        }
      } catch (err) {
        this.logger.error(`Error updating participants or starting room ${roomId}:`, err);
      }
    }

    // Broadcast that a user joined
    this.server.to(roomId).emit('user_joined', { userId, userProfile, timestamp: new Date() });
    
    // Send current participants count to everyone
    this.server.to(roomId).emit('room_stats_update', {
      participantsCount: this.roomParticipants.get(roomId)!.size
    });

    this.logger.log(`Client ${client.id} joined room ${roomId}`);
    return { event: 'joined', data: { roomId } };
  }

  @SubscribeMessage('update_profile')
  async handleUpdateProfile(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userId: string; userProfile: any },
  ) {
    const { roomId, userId, userProfile } = payload;
    this.server.to(roomId).emit('profile_updated', { userId, userProfile });
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userId: string },
  ) {
    const { roomId, userId } = payload;
    client.leave(roomId);
    
    if (this.roomParticipants.has(roomId)) {
      this.roomParticipants.get(roomId)!.delete(client.id);
    }

    if (userId) {
      try {
        const campfire = await this.campfireService.findById(roomId);
        if (campfire && campfire.hostId === userId && (campfire.status === 'ACTIVE' || (campfire.status as string) === 'LIVE')) {
          await this.campfireService.end(roomId, userId);
          this.server.to(roomId).emit('room_ended', { roomId, reason: 'Host left the room' });
        } else if (campfire && campfire.hostId !== userId) {
          await this.campfireService.updateParticipants(roomId, campfire.currentSpeakers || 0, Math.max(0, (campfire.currentListeners || 1) - 1));
        }
      } catch (e) {
        this.logger.error(`Error ending or updating room ${roomId} on leave:`, e);
      }
    }
    this.socketUserRoomMap.delete(client.id);

    this.server.to(roomId).emit('user_left', { userId, timestamp: new Date() });
    
    if (this.roomParticipants.has(roomId)) {
      this.server.to(roomId).emit('room_stats_update', {
        participantsCount: this.roomParticipants.get(roomId)!.size
      });
    }

    this.logger.log(`Client ${client.id} left room ${roomId}`);
    return { event: 'left', data: { roomId } };
  }

  @SubscribeMessage('send_message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; userId: string; userProfile: any; text: string },
  ) {
    const { roomId, userId, userProfile, text } = payload;
    
    this.server.to(roomId).emit('new_message', {
      id: Math.random().toString(36).substring(7),
      sender: userProfile.name,
      avatar: userProfile.avatar,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  }

  @SubscribeMessage('send_reaction')
  handleReaction(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: string; emoji: string },
  ) {
    const { roomId, emoji } = payload;
    this.server.to(roomId).emit('new_reaction', {
      emoji,
      id: Math.random().toString(36).substring(7),
      x: 50 + (Math.random() * 80 - 40),
      y: -100
    });
  }

  private async leaveAllRooms(client: Socket) {
    const userRoom = this.socketUserRoomMap.get(client.id);
    if (userRoom) {
      const { userId, roomId } = userRoom;
      try {
        const campfire = await this.campfireService.findById(roomId);
        if (campfire && campfire.hostId === userId && (campfire.status === 'ACTIVE' || (campfire.status as string) === 'LIVE')) {
          await this.campfireService.end(roomId, userId);
          this.server.to(roomId).emit('room_ended', { roomId, reason: 'Host left the room' });
        } else if (campfire && campfire.hostId !== userId) {
          await this.campfireService.updateParticipants(roomId, campfire.currentSpeakers || 0, Math.max(0, (campfire.currentListeners || 1) - 1));
        }
      } catch (e) {
        this.logger.error(`Error ending or updating room ${roomId} on disconnect:`, e);
      }
      this.socketUserRoomMap.delete(client.id);
    }

    for (const [roomId, participants] of this.roomParticipants.entries()) {
      if (participants.has(client.id)) {
        participants.delete(client.id);
        this.server.to(roomId).emit('room_stats_update', {
          participantsCount: participants.size
        });
      }
    }
  }
}
