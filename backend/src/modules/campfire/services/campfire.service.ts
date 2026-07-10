import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CampfireRepository } from '../repositories/campfire.repository';
import { CampfirePolicyService } from './campfire-policy.service';
import { CampfireCacheService } from './campfire-cache.service';
import { CreateCampfireDto } from '../dto/create-campfire.dto';
import { UpdateCampfireDto } from '../dto/update-campfire.dto';
import { CampfireQueryDto } from '../dto/campfire-query.dto';
import { CampfireEntity } from '../entities/campfire.entity';
import { CampfireStatus, CAMPFIRE_ERROR_MESSAGES } from '../constants/campfire.constant';
import { CampfireEventDispatcher } from '../events/campfire-event.dispatcher';

@Injectable()
export class CampfireService {
  constructor(
    private readonly repository: CampfireRepository,
    private readonly policyService: CampfirePolicyService,
    private readonly cacheService: CampfireCacheService,
    private readonly eventDispatcher: CampfireEventDispatcher,
    private readonly configService: ConfigService,
  ) {}

  async create(userId: string, dto: CreateCampfireDto): Promise<CampfireEntity> {
    if (!this.policyService.canCreateCampfire(userId, dto.communityId || '00000000-0000-0000-0000-000000000000')) {
      throw new ForbiddenException(CAMPFIRE_ERROR_MESSAGES.UNAUTHORIZED);
    }

    const defaultCapacity = this.configService.get<number>('campfire.limits.defaultCapacity', 50);
    const defaultSpeakerLimit = this.configService.get<number>('campfire.limits.defaultSpeakerLimit', 10);
    const defaultListenerLimit = this.configService.get<number>('campfire.limits.defaultListenerLimit', 50);

    const scheduledDate = dto.scheduledStartAt ? new Date(dto.scheduledStartAt) : undefined;
    const initialStatus = dto.status || (scheduledDate && scheduledDate > new Date() ? CampfireStatus.SCHEDULED : CampfireStatus.ACTIVE);
    const startedAt = initialStatus === CampfireStatus.ACTIVE ? new Date() : undefined;

    const { scheduledStartAt, ...restDto } = dto;

    const campfire = await this.repository.create({
      ...restDto,
      communityId: dto.communityId || '00000000-0000-0000-0000-000000000000',
      hostId: userId,
      status: initialStatus,
      scheduledStartAt: scheduledDate,
      startedAt,
      capacity: defaultCapacity,
      speakerLimit: defaultSpeakerLimit,
      listenerLimit: defaultListenerLimit,
      currentSpeakers: initialStatus === CampfireStatus.ACTIVE ? 1 : 0,
      currentListeners: 0,
    });

    await this.cacheService.setCampfire(campfire);
    this.eventDispatcher.dispatchCreated(campfire);

    return campfire;
  }

  async findById(id: string): Promise<CampfireEntity> {
    let campfire = await this.cacheService.getCampfire(id);

    if (!campfire) {
      campfire = await this.repository.findById(id);
      if (!campfire) {
        throw new NotFoundException(CAMPFIRE_ERROR_MESSAGES.NOT_FOUND);
      }
      await this.cacheService.setCampfire(campfire);
    }

    return campfire;
  }

  async findAndCount(query: CampfireQueryDto): Promise<{ data: CampfireEntity[]; total: number }> {
    const [data, total] = await this.repository.findAndCount(query);
    return { data, total };
  }

  async update(id: string, userId: string, dto: UpdateCampfireDto): Promise<CampfireEntity> {
    const campfire = await this.findById(id);

    if (!this.policyService.canUpdateCampfire(userId, campfire)) {
      throw new ForbiddenException(CAMPFIRE_ERROR_MESSAGES.UNAUTHORIZED);
    }

    const updated = await this.repository.update(id, dto);
    await this.cacheService.setCampfire(updated);
    this.eventDispatcher.dispatchUpdated(updated);

    return updated;
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const campfire = await this.findById(id);

    if (!this.policyService.canDeleteCampfire(userId, campfire)) {
      throw new ForbiddenException(CAMPFIRE_ERROR_MESSAGES.UNAUTHORIZED);
    }

    await this.repository.softDelete(id);
    await this.cacheService.invalidateCampfire(id);
    this.eventDispatcher.dispatchDeleted(id, campfire.communityId);
  }

  async start(id: string, userId: string): Promise<CampfireEntity> {
    const campfire = await this.findById(id);

    if (!this.policyService.canStartCampfire(userId, campfire)) {
      throw new ForbiddenException(CAMPFIRE_ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (campfire.status === CampfireStatus.ACTIVE) {
      throw new BadRequestException(CAMPFIRE_ERROR_MESSAGES.ALREADY_STARTED);
    }

    const updated = await this.repository.update(id, {
      status: CampfireStatus.ACTIVE,
      startedAt: new Date(),
      currentSpeakers: Math.max(1, campfire.currentSpeakers || 1),
    });

    await this.cacheService.setCampfire(updated);
    this.eventDispatcher.dispatchStarted(updated);

    return updated;
  }

  async end(id: string, userId: string): Promise<CampfireEntity> {
    const campfire = await this.findById(id);

    if (!this.policyService.canStopCampfire(userId, campfire)) {
      throw new ForbiddenException(CAMPFIRE_ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (campfire.status === CampfireStatus.ENDED) {
      throw new BadRequestException(CAMPFIRE_ERROR_MESSAGES.ALREADY_ENDED);
    }

    const updated = await this.repository.update(id, {
      status: CampfireStatus.ENDED,
      endedAt: new Date(),
      currentSpeakers: 0,
      currentListeners: 0,
    } as any);

    await this.cacheService.setCampfire(updated);
    this.eventDispatcher.dispatchClosed(updated);

    return updated;
  }

  async updateParticipants(id: string, currentSpeakers: number, currentListeners: number): Promise<CampfireEntity> {
    const updated = await this.repository.update(id, {
      currentSpeakers,
      currentListeners,
    } as any);
    await this.cacheService.setCampfire(updated);
    this.eventDispatcher.dispatchUpdated(updated);
    return updated;
  }

  async toggleReminder(id: string, userId: string): Promise<{ campfire: CampfireEntity; reminded: boolean }> {
    const campfire = await this.findById(id);
    const currentReminders = Array.isArray(campfire.remindedUserIds) ? [...campfire.remindedUserIds] : [];
    const index = currentReminders.indexOf(userId);
    let reminded = false;
    if (index > -1) {
      currentReminders.splice(index, 1);
    } else {
      currentReminders.push(userId);
      reminded = true;
    }

    const updated = await this.repository.update(id, { remindedUserIds: currentReminders } as any);
    await this.cacheService.setCampfire(updated);
    this.eventDispatcher.dispatchUpdated(updated);

    return { campfire: updated, reminded };
  }

  async findWorkspace(userId: string, tab: string): Promise<CampfireEntity[]> {
    if (tab === 'hosted') {
      const [items] = await this.repository.findAndCount({ hostId: userId, limit: 100 });
      return items;
    }
    if (tab === 'saved') {
      const [items] = await this.repository.findAndCount({ savedByUserId: userId, limit: 100 } as any);
      return items;
    }
    if (tab === 'joined') {
      const [items] = await this.repository.findAndCount({ participantUserId: userId, limit: 100 } as any);
      return items.filter(c => c.hostId !== userId).slice(0, 4);
    }
    return [];
  }

  async recordJoin(id: string, userId: string): Promise<void> {
    if (!id || !userId) return;
    const campfire = await this.repository.findById(id);
    if (!campfire || campfire.hostId === userId) return;

    const currentJoined = Array.isArray(campfire.joinedUserIds) ? [...campfire.joinedUserIds] : [];
    const filtered = currentJoined.filter((u) => u !== userId);
    filtered.push(userId);

    await this.repository.update(id, { joinedUserIds: filtered } as any);
  }
}

