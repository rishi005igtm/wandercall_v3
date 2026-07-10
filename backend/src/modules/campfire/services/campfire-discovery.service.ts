import { Injectable } from '@nestjs/common';
import { CampfireDiscoveryRepository } from '../repositories/campfire-discovery.repository';
import { CampfireDiscoveryCacheService } from './campfire-discovery-cache.service';
import { CampfireRankingService } from './campfire-ranking.service';
import { CampfireRecommendationService } from './campfire-recommendation.service';
import { CampfireCursorPaginationDto, CampfireSortField, CampfireDiscoveryResponse } from '../dto/campfire-discovery.dto';
import { CampfireStatus, CampfireVisibility } from '../constants/campfire.constant';

@Injectable()
export class CampfireDiscoveryService {
  constructor(
    private readonly repository: CampfireDiscoveryRepository,
    private readonly cacheService: CampfireDiscoveryCacheService,
    private readonly rankingService: CampfireRankingService,
    private readonly recommendationService: CampfireRecommendationService,
  ) {}

  async search(query: CampfireCursorPaginationDto): Promise<CampfireDiscoveryResponse> {
    // Determine if we have a stable query that should be cached
    const isBasicSearch = query.search && Object.keys(query).length <= 3; // search, limit, cursor
    const queryHash = isBasicSearch ? Buffer.from((query.search || '') + (query.cursor || '') + (query.limit || 20)).toString('base64') : null;

    if (queryHash) {
      const cached = await this.cacheService.getSearch(queryHash);
      if (cached) return cached;
    }

    const result = await this.repository.findDiscoverable(query);

    if (queryHash) {
      await this.cacheService.setSearch(queryHash, result);
    }

    return result;
  }

  async getTrending(query: CampfireCursorPaginationDto): Promise<CampfireDiscoveryResponse> {
    const limit = query.limit || 20;
    
    // Check cache
    const cached = await this.cacheService.getTrending(limit, query.cursor);
    if (cached) return cached;

    // Trending queries are just ACTIVE status, sorted by POPULARITY/TRENDING score
    const trendingQuery = { ...query, status: CampfireStatus.ACTIVE };
    const rawResult = await this.repository.findDiscoverable(trendingQuery);

    // Apply ranking logic to sort by trending score
    rawResult.items.sort((a, b) => {
      const scoreA = this.rankingService.calculateTrendingScore(a);
      const scoreB = this.rankingService.calculateTrendingScore(b);
      return scoreB - scoreA;
    });

    await this.cacheService.setTrending(limit, query.cursor, rawResult);
    return rawResult;
  }

  async getLive(query: CampfireCursorPaginationDto): Promise<CampfireDiscoveryResponse> {
    const limit = query.limit || 20;

    const cached = await this.cacheService.getLive(limit, query.cursor);
    if (cached) return cached;

    const liveQuery = { ...query, status: CampfireStatus.ACTIVE, sort: CampfireSortField.RECENTLY_STARTED };
    const result = await this.repository.findDiscoverable(liveQuery);

    await this.cacheService.setLive(limit, query.cursor, result);
    return result;
  }

  async getRecommended(userId: string, query: CampfireCursorPaginationDto): Promise<CampfireDiscoveryResponse> {
    const limit = query.limit || 20;

    const cached = await this.cacheService.getRecommended(userId, limit, query.cursor);
    if (cached) return cached;

    // Fetch active campfires
    const baseQuery = { ...query, status: CampfireStatus.ACTIVE, visibility: CampfireVisibility.PUBLIC };
    const result = await this.repository.findDiscoverable(baseQuery);

    // Score and sort for this specific user
    // Note: User context would usually come from a UserProfileService or similar.
    // For Phase 2, we simulate an empty context to rely on base popularity.
    result.items = await this.recommendationService.sortForUser(result.items, userId, {});

    await this.cacheService.setRecommended(userId, limit, query.cursor, result);
    return result;
  }

  async getGenericList(query: CampfireCursorPaginationDto): Promise<CampfireDiscoveryResponse> {
    return this.repository.findDiscoverable(query);
  }
}
