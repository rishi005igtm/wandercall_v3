import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CommunityEntity } from '../entities/community.entity';
import { CommunitySettingsEntity } from '../entities/community-settings.entity';
import { CommunityStatisticsEntity } from '../entities/community-statistics.entity';
import { CommunityMemberEntity, CommunityMemberStatus } from '../entities/community-member.entity';
import { CommunityCoordinateEntity } from '../entities/community-coordinate.entity';
import { CommunityRoleEntity } from '../entities/community-role.entity';
import { CommunityRepository } from '../repositories/community.repository';
import { CommunitySettingsRepository } from '../repositories/community-settings.repository';
import { CommunityStatisticsRepository } from '../repositories/community-statistics.repository';
import { CommunityMemberRepository } from '../repositories/community-member.repository';
import { CommunityEventDispatcher } from '../events/community-event.dispatcher';
import { CommunityInviteService } from './community-invite.service';
import { CreateCommunityDto } from '../dto/create-community.dto';
import { UpdateCommunityDto } from '../dto/update-community.dto';
import { UpdateCommunitySettingsDto } from '../dto/update-community-settings.dto';

@Injectable()
export class CommunityService {
  constructor(
    private readonly communityRepo: CommunityRepository,
    private readonly settingsRepo: CommunitySettingsRepository,
    private readonly statsRepo: CommunityStatisticsRepository,
    private readonly memberRepo: CommunityMemberRepository,
    private readonly eventDispatcher: CommunityEventDispatcher,
    private readonly inviteService: CommunityInviteService,
    private readonly dataSource: DataSource,
  ) {}

  async createCommunity(ownerId: string, dto: CreateCommunityDto): Promise<CommunityEntity> {
    const existing = await this.communityRepo.findBySlug(dto.slug);
    if (existing) {
      throw new ConflictException('Community with this slug already exists');
    }

    const savedCommunity = await this.dataSource.transaction(async (manager) => {
      // 1. Create Community
      const community = manager.create(CommunityEntity, {
        ...dto,
        ownerId,
        currentMemberCount: 1, // The owner
      });
      const saved = await manager.save(CommunityEntity, community);

      // 2. Create Settings
      const settings = manager.create(CommunitySettingsEntity, {
        communityId: saved.id,
      });
      await manager.save(CommunitySettingsEntity, settings);

      // 3. Create Statistics
      const stats = manager.create(CommunityStatisticsEntity, {
        communityId: saved.id,
        memberCount: 1,
      });
      await manager.save(CommunityStatisticsEntity, stats);

      // 4. Create Coordinates (PHYSICAL if lat/long provided, otherwise GLOBAL)
      if (!saved.coordinateId) {
        const isPhysical = dto.latitude !== undefined && dto.longitude !== undefined && dto.latitude !== 0 && dto.longitude !== 0;
        const coord = manager.create(CommunityCoordinateEntity, {
          categoryId: dto.primaryCategoryId,
          coordinateName: isPhysical ? (dto.coordinateName || dto.name) : 'Global Universe',
          coordinateType: isPhysical ? 'PHYSICAL' : 'GLOBAL',
          latitude: isPhysical ? dto.latitude : 0,
          longitude: isPhysical ? dto.longitude : 0,
          geohash: isPhysical ? `${dto.latitude},${dto.longitude}`.slice(0, 20) : 'global',
          city: isPhysical ? dto.city : undefined,
          region: isPhysical ? dto.region : undefined,
          country: isPhysical ? dto.country : undefined,
        });
        const savedCoord = await manager.save(CommunityCoordinateEntity, coord);
        saved.coordinateId = savedCoord.id;
        await manager.save(CommunityEntity, saved);
      }

      // 5. Create Owner Member with OWNER roleId
      const ownerRole = await manager.findOne(CommunityRoleEntity, { where: { name: 'OWNER' } });
      const member = manager.create(CommunityMemberEntity, {
        communityId: saved.id,
        userId: ownerId,
        roleId: ownerRole?.id,
        isOwner: true,
        status: CommunityMemberStatus.ACTIVE,
      });
      await manager.save(CommunityMemberEntity, member);

      return saved;
    });

    // 6. Send Initial Invites (outside transaction to avoid connection isolation deadlock)
    if (dto.invitedUserIds && dto.invitedUserIds.length > 0) {
      await this.inviteService.createInitialInvites(savedCommunity, ownerId, dto.invitedUserIds);
    }

    // 7. Dispatch Event
    this.eventDispatcher.dispatchCreated(savedCommunity.id, ownerId);

    return savedCommunity;
  }

  async getCommunityBySlug(slug: string): Promise<CommunityEntity> {
    const community = await this.communityRepo.findBySlug(slug);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return community;
  }

  async getUserCommunities(userId: string): Promise<CommunityEntity[]> {
    return this.communityRepo.findJoinedByUser(userId);
  }

  async getCommunityById(id: string): Promise<CommunityEntity> {
    const community = await this.communityRepo.findById(id);
    if (!community) {
      throw new NotFoundException('Community not found');
    }
    return community;
  }

  async updateCommunity(id: string, userId: string, dto: UpdateCommunityDto): Promise<CommunityEntity> {
    const community = await this.getCommunityById(id);
    if (community.ownerId !== userId) {
      throw new BadRequestException('Only the owner can update the community');
    }

    await this.communityRepo.update(id, dto);
    this.eventDispatcher.dispatchUpdated(id, userId);

    return this.getCommunityById(id);
  }

  async deleteCommunity(id: string, userId: string): Promise<void> {
    const community = await this.getCommunityById(id);
    if (community.ownerId !== userId) {
      throw new BadRequestException('Only the owner can delete the community');
    }

    await this.communityRepo.delete(id);
    this.eventDispatcher.dispatchDeleted(id, userId);
  }

  async getSettings(communityId: string): Promise<CommunitySettingsEntity> {
    const settings = await this.settingsRepo.findByCommunityId(communityId);
    if (!settings) {
      throw new NotFoundException('Settings not found');
    }
    return settings;
  }

  async updateSettings(communityId: string, userId: string, dto: UpdateCommunitySettingsDto): Promise<CommunitySettingsEntity> {
    const community = await this.getCommunityById(communityId);
    if (community.ownerId !== userId) {
      throw new BadRequestException('Only the owner can update settings');
    }

    await this.settingsRepo.update(communityId, dto);
    this.eventDispatcher.dispatchSettingsUpdated(communityId, userId);

    return this.getSettings(communityId);
  }
}
