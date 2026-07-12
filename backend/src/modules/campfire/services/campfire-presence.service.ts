import { Injectable, Logger, OnModuleInit, Optional, Inject, forwardRef } from '@nestjs/common';
import { RedisService } from '../../redis/redis-core.service';
import { CampfireEventDispatcher, CampfireParticipantEventPayload } from '../events/campfire-event.dispatcher';
import { CampfireRepository } from '../repositories/campfire.repository';

export interface CampfirePresenceParticipant {
  userId: string;
  displayName: string;
  avatar: string;
  role: string;
  joinTime: number;
  socketId?: string;
}

@Injectable()
export class CampfirePresenceService implements OnModuleInit {
  private readonly logger = new Logger(CampfirePresenceService.name);

  // In-memory fallbacks if Redis is not ready or during fallback mode
  private readonly fallbackOnlineSets = new Map<string, Set<string>>();
  private readonly fallbackParticipants = new Map<string, Map<string, CampfirePresenceParticipant>>();
  public readonly fallbackJoinedCampfires = new Map<string, string[]>();
  private readonly fallbackSeats = new Map<string, Map<number, string>>(); // roomId -> Map<seatIndex, userId>

  constructor(
    @Optional() private readonly redisService: RedisService,
    private readonly eventDispatcher: CampfireEventDispatcher,
    @Optional() @Inject(forwardRef(() => CampfireRepository)) private readonly campfireRepository?: CampfireRepository,
  ) {}

  onModuleInit() {
    if (this.redisService?.client) {
      this.logger.log('CampfirePresenceService initialized with Enterprise Redis Storage (Sets, Cohort Hash, TTL)');
    } else {
      this.logger.warn('RedisService not injected or unavailable. Using high-performance in-memory presence fallback.');
    }
  }

  async registerParticipantJoin(
    campfireId: string,
    userId: string,
    userProfile: any,
    socketId: string,
  ): Promise<{ success: boolean; participantCount: number; error?: string }> {
    if (!campfireId || !userId) {
      return { success: false, participantCount: 0, error: 'Invalid join identifiers' };
    }

    const displayName = userProfile?.name || userProfile?.displayName || 'Explorer';
    const avatar = userProfile?.avatar || userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    const role = userProfile?.role ? userProfile.role.toUpperCase() : 'LISTENER';

    const participant: CampfirePresenceParticipant = {
      userId,
      displayName,
      avatar,
      role,
      joinTime: Date.now(),
      socketId,
    };

    const ttl = 300; // 5-minute presence TTL renews on heartbeat or active socket
    let participantCount = 1;
    let isNewJoin = true;

    const client = this.redisService?.client;
    if (client && client.status === 'ready') {
      try {
        const onlineSetKey = `presence:campfire:${campfireId}:online`;
        const cohortHashKey = `presence:room:campfire:${campfireId}:cohorts`;
        const userKey = `presence:user:${userId}:campfire`;

        // Check if user was already inside
        const alreadyOnline = await client.sismember(onlineSetKey, userId);
        if (alreadyOnline === 1) {
          isNewJoin = false;
        }

        // 1. Update user presence TTL
        await client.hset(userKey, {
          status: 'In Campfire',
          campfireId,
          lastSeen: Date.now().toString(),
        });
        await client.expire(userKey, ttl);

        // 2. Add user to campfire online set
        await client.sadd(onlineSetKey, userId);
        await client.expire(onlineSetKey, ttl * 10);

        // 3. Store participant payload in room hash
        await client.hset(cohortHashKey, userId, JSON.stringify(participant));

        // 3.5. Track recently joined campfires for workspace (max 4), excluding the host
        if (role !== 'host' && role !== 'HOST') {
          const historyKey = `presence:user:${userId}:joined_campfires`;
          await client.zadd(historyKey, Date.now(), campfireId);
          await client.zremrangebyrank(historyKey, 0, -5);
        }

        // 4. Get active count
        participantCount = await client.scard(onlineSetKey);
      } catch (err: any) {
        this.logger.error(`Redis registerParticipantJoin error: ${err.message}. Using fallback.`);
        const res = this.registerJoinFallback(campfireId, userId, participant);
        participantCount = res.count;
        isNewJoin = res.isNew;
      }
    } else {
      const res = this.registerJoinFallback(campfireId, userId, participant);
      participantCount = res.count;
      isNewJoin = res.isNew;
    }

    this.logger.log(`[Presence] Participant ${userId} (${displayName}) registered in room ${campfireId}. Online count: ${participantCount}`);

    // Always emit domain event so gateways broadcast reliable real-time presence updates to all room participants
    const payload: CampfireParticipantEventPayload = {
      campfireId,
      userId,
      displayName,
      avatar,
      role,
      action: 'JOINED',
      timestamp: new Date().toISOString(),
    };
    this.eventDispatcher.emitParticipantJoined(payload);

    return { success: true, participantCount };
  }

  async registerParticipantLeave(
    campfireId: string,
    userId: string,
    socketId?: string,
  ): Promise<{ success: boolean; participantCount: number }> {
    if (!campfireId || !userId) {
      return { success: false, participantCount: 0 };
    }

    let participantCount = 0;
    let participantData: CampfirePresenceParticipant | null = null;
    let wasRemoved = false;

    const client = this.redisService?.client;
    if (client && client.status === 'ready') {
      try {
        const onlineSetKey = `presence:campfire:${campfireId}:online`;
        const cohortHashKey = `presence:room:campfire:${campfireId}:cohorts`;
        const userKey = `presence:user:${userId}:campfire`;

        const rawData = await client.hget(cohortHashKey, userId);
        if (rawData) {
          try {
            participantData = JSON.parse(rawData);
          } catch {}
        }

        const removedCount = await client.srem(onlineSetKey, userId);
        wasRemoved = removedCount > 0;

        await client.hdel(cohortHashKey, userId);
        await client.del(userKey);

        // Auto-remove from seat if seated
        const seatsKey = `presence:campfire:${campfireId}:seats`;
        const currentSeats = await client.hgetall(seatsKey);
        for (const [seatIdx, occupantId] of Object.entries(currentSeats)) {
          if (occupantId === userId) {
            await client.hdel(seatsKey, seatIdx);
            this.logger.log(`[Presence] Auto-removed participant ${userId} from seat ${seatIdx} in room ${campfireId}`);
          }
        }

        participantCount = await client.scard(onlineSetKey);
      } catch (err: any) {
        this.logger.error(`Redis registerParticipantLeave error: ${err.message}. Using fallback.`);
        const res = this.registerLeaveFallback(campfireId, userId);
        participantCount = res.count;
        participantData = res.data;
        wasRemoved = res.wasRemoved;
        this.fallbackLeaveSeatAuto(campfireId, userId);
      }
    } else {
      const res = this.registerLeaveFallback(campfireId, userId);
      participantCount = res.count;
      participantData = res.data;
      wasRemoved = res.wasRemoved;
      this.fallbackLeaveSeatAuto(campfireId, userId);
    }

    this.logger.log(`[Presence] Participant ${userId} left room ${campfireId}. Online count: ${participantCount}`);

    // Always emit left payload so clients immediately remove top seat or guest avatar and display toast
    const payload: CampfireParticipantEventPayload = {
      campfireId,
      userId,
      displayName: participantData?.displayName || 'Explorer',
      avatar: participantData?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: participantData?.role || 'LISTENER',
      action: 'LEFT',
      timestamp: new Date().toISOString(),
    };
    this.eventDispatcher.emitParticipantLeft(payload);

    return { success: true, participantCount };
  }

  async getRoomPresenceSnapshot(
    campfireId: string,
    hostId?: string,
  ): Promise<{ participantsCount: number; onlineUserIds: string[]; isHostOnline: boolean }> {
    const client = this.redisService?.client;
    let onlineUserIds: string[] = [];
    let isHostInCohorts = false;

    if (client && client.status === 'ready') {
      try {
        const onlineSetKey = `presence:campfire:${campfireId}:online`;
        const cohortHashKey = `presence:room:campfire:${campfireId}:cohorts`;
        onlineUserIds = await client.smembers(onlineSetKey);

        for (const uid of onlineUserIds) {
          const rawData = await client.hget(cohortHashKey, uid);
          if (rawData) {
            try {
              const p = JSON.parse(rawData);
              if (p && (p.role === 'HOST' || p.role === 'host')) {
                isHostInCohorts = true;
                break;
              }
            } catch {}
          }
        }
      } catch (err: any) {
        this.logger.error(`Redis getRoomPresenceSnapshot error: ${err.message}`);
        const set = this.fallbackOnlineSets.get(campfireId);
        if (set) onlineUserIds = Array.from(set);
      }
    } else {
      const set = this.fallbackOnlineSets.get(campfireId);
      if (set) {
        onlineUserIds = Array.from(set);
        const cohortMap = this.fallbackParticipants.get(campfireId);
        if (cohortMap) {
          for (const uid of onlineUserIds) {
            const p = cohortMap.get(uid);
            if (p && (p.role === 'HOST' || p.role === 'host')) {
              isHostInCohorts = true;
              break;
            }
          }
        }
      }
    }

    let resolvedHostId = hostId;
    if (!resolvedHostId && this.campfireRepository) {
      try {
        const entity = await this.campfireRepository.findById(campfireId);
        if (entity?.hostId) {
          resolvedHostId = entity.hostId;
        }
      } catch (e: any) {
        this.logger.error(`Error resolving hostId from repository: ${e.message}`);
      }
    }

    const isHostOnline = (resolvedHostId ? onlineUserIds.includes(resolvedHostId) : false) || isHostInCohorts;
    return {
      participantsCount: onlineUserIds.length,
      onlineUserIds,
      isHostOnline,
    };
  }

  private registerJoinFallback(
    campfireId: string,
    userId: string,
    participant: CampfirePresenceParticipant,
  ): { count: number; isNew: boolean } {
    if (!this.fallbackOnlineSets.has(campfireId)) {
      this.fallbackOnlineSets.set(campfireId, new Set());
    }
    if (!this.fallbackParticipants.has(campfireId)) {
      this.fallbackParticipants.set(campfireId, new Map());
    }

    const onlineSet = this.fallbackOnlineSets.get(campfireId)!;
    const isNew = !onlineSet.has(userId);

    onlineSet.add(userId);
    this.fallbackParticipants.get(campfireId)!.set(userId, participant);

    if (participant.role !== 'host' && participant.role !== 'HOST') {
      const history = this.fallbackJoinedCampfires.get(userId) || [];
      const updatedHistory = [campfireId, ...history.filter(id => id !== campfireId)].slice(0, 4);
      this.fallbackJoinedCampfires.set(userId, updatedHistory);
    }

    return { count: onlineSet.size, isNew };
  }

  private registerLeaveFallback(
    campfireId: string,
    userId: string,
  ): { count: number; wasRemoved: boolean; data: CampfirePresenceParticipant | null } {
    const onlineSet = this.fallbackOnlineSets.get(campfireId);
    const cohortMap = this.fallbackParticipants.get(campfireId);

    const wasRemoved = onlineSet ? onlineSet.delete(userId) : false;
    const data = cohortMap?.get(userId) || null;
    cohortMap?.delete(userId);

    return { count: onlineSet?.size || 0, wasRemoved, data };
  }

  // --- SEATING LOGIC ---

  async takeSeat(campfireId: string, userId: string, seatIndex: number): Promise<{ success: boolean; error?: string }> {
    if (seatIndex < 1 || seatIndex > 5) {
      return { success: false, error: 'Invalid seat index. Must be 1-5.' };
    }

    const client = this.redisService?.client;
    if (client && client.status === 'ready') {
      try {
        const seatsKey = `presence:campfire:${campfireId}:seats`;
        // First check if user is already seated
        const currentSeats = await client.hgetall(seatsKey);
        if (Object.values(currentSeats).includes(userId)) {
          return { success: false, error: 'You are already seated.' };
        }
        
        // Then check if target seat is full
        if (currentSeats[seatIndex.toString()]) {
          return { success: false, error: 'Seat is already occupied.' };
        }

        // Limit checking
        if (Object.keys(currentSeats).length >= 5) {
          return { success: false, error: 'All 5 seats are full.' };
        }

        await client.hset(seatsKey, seatIndex.toString(), userId);
        return { success: true };
      } catch (err: any) {
        this.logger.error(`Redis takeSeat error: ${err.message}. Using fallback.`);
      }
    }

    // Fallback
    if (!this.fallbackSeats.has(campfireId)) {
      this.fallbackSeats.set(campfireId, new Map());
    }
    const roomSeats = this.fallbackSeats.get(campfireId)!;
    
    // Check if user already seated
    for (const val of roomSeats.values()) {
      if (val === userId) return { success: false, error: 'You are already seated.' };
    }
    if (roomSeats.has(seatIndex)) return { success: false, error: 'Seat is already occupied.' };
    if (roomSeats.size >= 5) return { success: false, error: 'All 5 seats are full.' };
    
    roomSeats.set(seatIndex, userId);
    return { success: true };
  }

  async leaveSeat(campfireId: string, userId: string): Promise<{ success: boolean }> {
    const client = this.redisService?.client;
    if (client && client.status === 'ready') {
      try {
        const seatsKey = `presence:campfire:${campfireId}:seats`;
        const currentSeats = await client.hgetall(seatsKey);
        for (const [seatIdx, occupantId] of Object.entries(currentSeats)) {
          if (occupantId === userId) {
            await client.hdel(seatsKey, seatIdx);
            return { success: true };
          }
        }
        return { success: true }; // Not seated anyway
      } catch (err: any) {
        this.logger.error(`Redis leaveSeat error: ${err.message}. Using fallback.`);
      }
    }

    this.fallbackLeaveSeatAuto(campfireId, userId);
    return { success: true };
  }

  async getRoomSeatsSnapshot(campfireId: string): Promise<Record<number, { userId: string; profile?: any } | null>> {
    const snapshot: Record<number, { userId: string; profile?: any } | null> = { 1: null, 2: null, 3: null, 4: null, 5: null };
    const client = this.redisService?.client;
    
    if (client && client.status === 'ready') {
      try {
        const seatsKey = `presence:campfire:${campfireId}:seats`;
        const cohortHashKey = `presence:room:campfire:${campfireId}:cohorts`;
        const currentSeats = await client.hgetall(seatsKey);
        
        for (const [seatIdx, occupantId] of Object.entries(currentSeats)) {
          const idx = parseInt(seatIdx);
          if (idx >= 1 && idx <= 5) {
            let profile = undefined;
            const rawData = await client.hget(cohortHashKey, occupantId);
            if (rawData) {
              try {
                profile = JSON.parse(rawData);
              } catch {}
            }
            snapshot[idx] = { userId: occupantId, profile };
          }
        }
        return snapshot;
      } catch (err: any) {}
    }

    const roomSeats = this.fallbackSeats.get(campfireId);
    if (roomSeats) {
      const cohortMap = this.fallbackParticipants.get(campfireId);
      for (const [seatIdx, occupantId] of roomSeats.entries()) {
        if (seatIdx >= 1 && seatIdx <= 5) {
          const profile = cohortMap?.get(occupantId);
          snapshot[seatIdx] = { userId: occupantId, profile };
        }
      }
    }
    return snapshot;
  }

  private fallbackLeaveSeatAuto(campfireId: string, userId: string) {
    const roomSeats = this.fallbackSeats.get(campfireId);
    if (roomSeats) {
      for (const [seatIdx, occupantId] of roomSeats.entries()) {
        if (occupantId === userId) {
          roomSeats.delete(seatIdx);
          this.logger.log(`[Presence] Auto-removed participant ${userId} from seat ${seatIdx} in room ${campfireId} (fallback)`);
        }
      }
    }
  }
}
