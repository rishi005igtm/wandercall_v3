import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityEntity } from '../entities/community.entity';
import { CommunityCategoryEntity } from '../entities/community-category.entity';
import { CommunityCoordinateEntity } from '../entities/community-coordinate.entity';
import { CommunityCategoryRepository } from '../repositories/community-category.repository';
import { CommunityCoordinateRepository } from '../repositories/community-coordinate.repository';
import { CommunityVisibility, CommunityStatus } from '../constants/community.constant';
import { CommunityPresenceTracker } from './community-presence.tracker';

@Injectable()
export class CommunityDiscoveryService {
  constructor(
    @InjectRepository(CommunityEntity)
    private readonly communityRepo: Repository<CommunityEntity>,
    private readonly categoryRepo: CommunityCategoryRepository,
    private readonly coordinateRepo: CommunityCoordinateRepository,
    private readonly presenceTracker: CommunityPresenceTracker,
  ) {}

  async searchCommunities(query: string, limit = 20, cursor?: string): Promise<CommunityEntity[]> {
    const qb = this.communityRepo.createQueryBuilder('c')
      .where('c.visibility = :visibility', { visibility: CommunityVisibility.PUBLIC })
      .andWhere('c.status = :status', { status: CommunityStatus.ACTIVE })
      .andWhere('(c.name ILIKE :query OR c.slug ILIKE :query OR c.description ILIKE :query)', { query: `%${query}%` })
      .orderBy('c.currentMemberCount', 'DESC')
      .take(limit);

    if (cursor) {
      // Basic cursor logic using currentMemberCount and id tie-breaker
      // Assuming cursor is base64 encoded JSON { currentMemberCount, id }
      // This is a simplified version for the core foundation
      try {
        const parsed = JSON.parse(Buffer.from(cursor, 'base64').toString('ascii'));
        qb.andWhere('(c.currentMemberCount < :count OR (c.currentMemberCount = :count AND c.id < :id))', {
          count: parsed.currentMemberCount,
          id: parsed.id,
        });
      } catch (e) {
        // ignore invalid cursor
      }
    }

    return qb.getMany();
  }

  async getGalaxyClusters(categoryId?: string): Promise<any> {
    // In a real scenario, this would aggregate coordinates and join communities
    // For the core foundation, we'll return a structured query
    const qb = this.communityRepo.createQueryBuilder('c')
      .where('c.visibility = :visibility', { visibility: CommunityVisibility.PUBLIC })
      .andWhere('c.status = :status', { status: CommunityStatus.ACTIVE });

    if (categoryId) {
      qb.andWhere('c.primaryCategoryId = :categoryId', { categoryId });
    }

    // Get top communities per coordinate (simplified)
    qb.orderBy('c.currentMemberCount', 'DESC');
    qb.take(50); // Fetch top 50 global or category communities for the galaxy view

    const communities = await qb.getMany();

    // Group by coordinate (simulating galaxy clusters) and filter by isLive
    const clusters = {};
    for (const community of communities) {
      const liveStats = this.presenceTracker.getCommunityLiveStats(community.id);
      
      // Only include communities that are live (>= 2 online members)
      if (!liveStats.isLive) {
        continue;
      }

      // Decorate entity with dynamic stats
      (community as any).isLive = liveStats.isLive;
      (community as any).onlineMemberCount = liveStats.onlineMemberCount;
      (community as any).activeMemberCount = liveStats.onlineMemberCount;

      const coordId = community.coordinateId || 'undefined-space';
      if (!clusters[coordId]) {
        clusters[coordId] = [];
      }
      if (clusters[coordId].length < 5) {
        clusters[coordId].push(community);
      }
    }

    return clusters;
  }

  async getCategories(): Promise<CommunityCategoryEntity[]> {
    return this.categoryRepo.findAll();
  }

  async getCoordinates(categoryId?: string): Promise<CommunityCoordinateEntity[]> {
    if (categoryId) {
      return this.coordinateRepo.findByCategoryId(categoryId);
    }
    return this.coordinateRepo.findAll();
  }
}
