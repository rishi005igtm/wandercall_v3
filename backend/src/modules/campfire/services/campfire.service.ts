import { Injectable, NotFoundException, ForbiddenException, Logger, Optional, Inject, forwardRef } from '@nestjs/common';
import { CampfireRepository } from '../repositories/campfire.repository';
import { CampfireEventDispatcher } from '../events/campfire-event.dispatcher';
import { CampfirePresenceService } from './campfire-presence.service';
import { CreateCampfireDto } from '../dto/create-campfire.dto';
import { CampfireStatus, CAMPFIRE_ERROR_MESSAGES } from '../constants/campfire.constant';
import { CampfireEntity } from '../entities/campfire.entity';

@Injectable()
export class CampfireService {
  private readonly logger = new Logger(CampfireService.name);

  constructor(
    private readonly repository: CampfireRepository,
    private readonly eventDispatcher: CampfireEventDispatcher,
    @Optional() @Inject(forwardRef(() => CampfirePresenceService)) private readonly presenceService?: CampfirePresenceService,
  ) {}

  async create(hostId: string, dto: CreateCampfireDto): Promise<CampfireEntity> {
    const isScheduled = !!dto.scheduledStartAt;
    
    // Safely extract scheduledStartAt to avoid type issues with spread
    const { scheduledStartAt, ...restDto } = dto;
    
    const campfire = await this.repository.create({
      ...restDto,
      hostId,
      status: isScheduled ? CampfireStatus.SCHEDULED : CampfireStatus.LIVE,
      startedAt: isScheduled ? null : new Date(),
      scheduledStartAt: scheduledStartAt ? new Date(scheduledStartAt) : null,
    });

    this.eventDispatcher.emitCreated(campfire);

    if (!isScheduled) {
      this.eventDispatcher.emitStarted(campfire);
    }

    return campfire;
  }

  async findById(id: string): Promise<any> {
    const campfire = await this.repository.findById(id);
    if (!campfire) throw new NotFoundException(CAMPFIRE_ERROR_MESSAGES.NOT_FOUND);
    
    if (this.presenceService) {
      const snapshot = await this.presenceService.getRoomPresenceSnapshot(id, campfire.hostId);
      return {
        ...campfire,
        currentParticipants: snapshot.participantsCount,
        participantsCount: snapshot.participantsCount,
        isHostOnline: snapshot.isHostOnline,
        onlineUserIds: snapshot.onlineUserIds,
      };
    }

    return campfire;
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const campfire = await this.findById(id);
    if (campfire.hostId !== userId) {
      throw new ForbiddenException(CAMPFIRE_ERROR_MESSAGES.UNAUTHORIZED);
    }

    await this.repository.softDelete(id);
    
    this.eventDispatcher.emitDeleted(id);
  }

  async endSession(id: string, userId: string): Promise<CampfireEntity> {
    const campfire = await this.findById(id);
    if (campfire.hostId !== userId) {
      throw new ForbiddenException(CAMPFIRE_ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (campfire.status !== CampfireStatus.LIVE) {
      throw new ForbiddenException(CAMPFIRE_ERROR_MESSAGES.INVALID_STATUS_TRANSITION);
    }

    const updated = await this.repository.update(id, {
      status: CampfireStatus.ENDED,
      endedAt: new Date(),
    });

    this.eventDispatcher.emitEnded(updated);
    
    return updated;
  }

  async restartSession(id: string, userId: string): Promise<CampfireEntity> {
    const campfire = await this.findById(id);
    if (campfire.hostId !== userId) {
      throw new ForbiddenException(CAMPFIRE_ERROR_MESSAGES.UNAUTHORIZED);
    }

    // You can restart an ENDED session, or "restart" a LIVE one (force refresh room)
    const updated = await this.repository.update(id, {
      status: CampfireStatus.LIVE,
      startedAt: new Date(),
      endedAt: null, // Reset ended at
    });

    this.eventDispatcher.emitRestarted(updated);
    
    return updated;
  }

  async getLiveCampfires(limit: number = 20, offset: number = 0): Promise<{ items: CampfireEntity[], total: number }> {
    const [items, total] = await this.repository.findLive(limit, offset);
    return { items, total };
  }

  async search(query: any): Promise<{ items: CampfireEntity[], total: number }> {
    const [items, total] = await this.repository.search(query);
    return { items, total };
  }

  async getWorkspace(userId: string, tab: 'hosted' | 'joined' | 'saved'): Promise<any[]> {
    if (tab === 'hosted') {
      const [items] = await this.repository.search({ hostId: userId, limit: 100 });
      return items;
    }

    if (tab === 'joined') {
      let campfireIds: string[] = [];

      if (!this.presenceService || !this.presenceService['redisService']) {
        campfireIds = this.presenceService?.fallbackJoinedCampfires.get(userId) || [];
      } else {
        const client = this.presenceService['redisService'].client;
        if (!client || client.status !== 'ready') {
          campfireIds = this.presenceService.fallbackJoinedCampfires.get(userId) || [];
        } else {
          const historyKey = `presence:user:${userId}:joined_campfires`;
          // Get the highest scores (most recent)
          campfireIds = await client.zrevrange(historyKey, 0, -1);
        }
      }

      if (!campfireIds || campfireIds.length === 0) return [];

      // Fetch these campfires from database
      const promises = campfireIds.map(id => this.findById(id).catch(() => null));
      const campfires = await Promise.all(promises);

      return campfires.filter(c => c !== null);
    }

    if (tab === 'saved') {
      // Saved logic not currently implemented in DB
      return [];
    }

    return [];
  }
}
