import { Injectable, Logger } from '@nestjs/common';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LiveSessionEntity, LiveSessionStatus } from '../entities/live-session.entity';
import { CampfireEntity } from '../entities/campfire.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LivekitService {
  private readonly logger = new Logger(LivekitService.name);
  private readonly roomService: RoomServiceClient;

  constructor(
    private configService: ConfigService,
    @InjectRepository(LiveSessionEntity)
    private readonly liveSessionRepository: Repository<LiveSessionEntity>,
    @InjectRepository(CampfireEntity)
    private readonly campfireRepository: Repository<CampfireEntity>,
  ) {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || 'devkey';
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET') || 'secret';
    const wsUrl = this.configService.get<string>('LIVEKIT_HOST') || 'ws://localhost:7880';
    
    this.roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret);
  }

  async generateToken(campfireId: string, userId: string, role: string, name: string): Promise<{ token: string, roomName: string }> {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY') || 'devkey';
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET') || 'secret';
    
    // Find or create an active LiveSession for this Campfire
    let activeSession = await this.liveSessionRepository.findOne({
      where: { campfireId, status: LiveSessionStatus.ACTIVE }
    });

    if (!activeSession) {
      const campfire = await this.campfireRepository.findOne({ where: { id: campfireId }});
      if (!campfire) throw new Error("Campfire not found");

      const roomName = `campfire-${campfireId}-session-${uuidv4()}`;
      activeSession = this.liveSessionRepository.create({
        campfireId,
        roomName,
        hostId: campfire.hostId,
        status: LiveSessionStatus.ACTIVE
      });
      await this.liveSessionRepository.save(activeSession);
    }

    const roomName = activeSession.roomName;

    // Determine publish permissions based on role.
    // By default, only Host and Speakers can publish audio.
    const canPublish = role === 'Host' || role === 'Speaker' || role === 'HOST' || role === 'SPEAKER';
    
    const at = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: name,
    });
    
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: canPublish,
      canSubscribe: true,
    });
    
    // --- ENTERPRISE AUDIT LOG (Phase 8) ---
    console.log(`[AUDIT - Phase 8] generateToken(): Granted permissions for ${userId} (Role: ${role}): canPublish=${canPublish}, canSubscribe=true`);
    // -------------------------------------
    
    
    return { token: await at.toJwt(), roomName };
  }

  async getActiveSessionRoomName(campfireId: string): Promise<string | null> {
    const activeSession = await this.liveSessionRepository.findOne({
      where: { campfireId, status: LiveSessionStatus.ACTIVE }
    });
    return activeSession ? activeSession.roomName : null;
  }

  async updateParticipantPermissions(campfireId: string, userId: string, canPublish: boolean): Promise<void> {
    try {
      // Find the active session room name
      const roomName = await this.getActiveSessionRoomName(campfireId);
      if (!roomName) {
        throw new Error(`No active LiveSession found for campfire ${campfireId}`);
      }

      // --- ENTERPRISE AUDIT LOG (Phase 9) ---
      const wsUrl = this.configService.get<string>('LIVEKIT_HOST') || 'ws://localhost:7880';
      console.log(`[AUDIT - Phase 9] updateParticipantPermissions(): Attempting to reach LiveKit Server at ${wsUrl} to update permissions for ${userId} in ${roomName} (canPublish=${canPublish})`);
      // -------------------------------------
      await this.roomService.updateParticipant(roomName, userId, undefined, {
        canPublish: canPublish,
        canSubscribe: true,
        canPublishData: true,
      });
      this.logger.debug(`Updated LiveKit permissions for ${userId} in room ${roomName}: canPublish=${canPublish}`);
      console.log(`[AUDIT - Phase 9] SUCCESS: Reached LiveKit Server and updated permissions for ${userId}`);
    } catch (error: any) {
      this.logger.warn(`Failed to update LiveKit permissions for ${userId} in campfire ${campfireId}: ${error.message}`);
      console.log(`[AUDIT - Phase 9] FAILED: Could not reach LiveKit Server. Fetch failed. Error:`, error.message);
    }
  }

  getWsUrl(): string {
    return this.configService.get<string>('LIVEKIT_HOST') || 'ws://localhost:7880';
  }

  async endLiveSession(campfireId: string): Promise<void> {
    const activeSession = await this.liveSessionRepository.findOne({
      where: { campfireId, status: LiveSessionStatus.ACTIVE }
    });
    if (activeSession) {
      activeSession.status = LiveSessionStatus.ENDED;
      activeSession.endedAt = new Date();
      await this.liveSessionRepository.save(activeSession);
      this.logger.log(`[Lifecycle] LiveSession ${activeSession.roomName} ended for Campfire ${campfireId}`);
    }
  }
}
