import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis-core.service';
import { CampfireDiscoveryResponse } from '../dto/campfire-discovery.dto';

@Injectable()
export class CampfireDiscoveryCacheService {
  private readonly logger = new Logger(CampfireDiscoveryCacheService.name);
  
  // Different TTLs based on how frequently data changes
  private readonly trendingTtl: number;
  private readonly liveTtl: number;
  private readonly recommendedTtl: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.trendingTtl = this.configService.get<number>('campfire.cache.trendingTtl') || 300; // 5 mins
    this.liveTtl = this.configService.get<number>('campfire.cache.liveTtl') || 60; // 1 min
    this.recommendedTtl = this.configService.get<number>('campfire.cache.recommendedTtl') || 600; // 10 mins
  }

  // --- Trending ---
  async getTrending(limit: number, cursor?: string): Promise<CampfireDiscoveryResponse | null> {
    return this.getCache(`campfire:discovery:trending:${limit}:${cursor || 'none'}`);
  }

  async setTrending(limit: number, cursor: string | undefined, data: CampfireDiscoveryResponse): Promise<void> {
    await this.setCache(`campfire:discovery:trending:${limit}:${cursor || 'none'}`, data, this.trendingTtl);
  }

  // --- Live ---
  async getLive(limit: number, cursor?: string): Promise<CampfireDiscoveryResponse | null> {
    return this.getCache(`campfire:discovery:live:${limit}:${cursor || 'none'}`);
  }

  async setLive(limit: number, cursor: string | undefined, data: CampfireDiscoveryResponse): Promise<void> {
    await this.setCache(`campfire:discovery:live:${limit}:${cursor || 'none'}`, data, this.liveTtl);
  }

  // --- Recommended ---
  async getRecommended(userId: string, limit: number, cursor?: string): Promise<CampfireDiscoveryResponse | null> {
    return this.getCache(`campfire:discovery:recommended:${userId}:${limit}:${cursor || 'none'}`);
  }

  async setRecommended(userId: string, limit: number, cursor: string | undefined, data: CampfireDiscoveryResponse): Promise<void> {
    await this.setCache(`campfire:discovery:recommended:${userId}:${limit}:${cursor || 'none'}`, data, this.recommendedTtl);
  }

  // --- Generic Generic Search ---
  // Search isn't cached as aggressively since it's highly dynamic, but for exact match caching:
  async getSearch(queryHash: string): Promise<CampfireDiscoveryResponse | null> {
    return this.getCache(`campfire:discovery:search:${queryHash}`);
  }

  async setSearch(queryHash: string, data: CampfireDiscoveryResponse): Promise<void> {
    await this.setCache(`campfire:discovery:search:${queryHash}`, data, 60); // 1 minute
  }

  // --- Invalidation ---
  /**
   * Invalidates discovery caches when campfires change.
   * Wildcards are generally bad in Redis, so we will use a set or just accept that discovery
   * endpoints might be slightly stale. However, we can track cache keys or use UNLINK on known patterns
   * if we are careful, or simply wait for TTL expiry. 
   * Since this is enterprise, deleting by pattern `KEYS` is a blocking operation and anti-pattern.
   * Instead, we will keep cache TTLs short (e.g. 1 min for live) and let them naturally expire, 
   * OR we can use Redis SCAN to incrementally delete if forced.
   * For Phase 2, we will use a small SCAN operation or just rely on short TTLs for performance.
   */
  async invalidateAllDiscovery(): Promise<void> {
    try {
      // In a real enterprise system, we would use SCAN iteratively. 
      // This is a simplified approach for the initial phase.
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redisService.client.scan(
          cursor,
          'MATCH',
          'campfire:discovery:*',
          'COUNT',
          100
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.redisService.client.del(...keys);
        }
      } while (cursor !== '0');
      
      this.logger.debug('Invalidated campfire discovery cache');
    } catch (error) {
      this.logger.error(`Failed to invalidate discovery cache: ${error.message}`);
    }
  }

  // --- Private Helpers ---
  private async getCache(key: string): Promise<CampfireDiscoveryResponse | null> {
    try {
      const data = await this.redisService.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as CampfireDiscoveryResponse;
    } catch (error) {
      this.logger.error(`Failed to get cache ${key}: ${error.message}`);
      return null;
    }
  }

  private async setCache(key: string, data: CampfireDiscoveryResponse, ttl: number): Promise<void> {
    try {
      await this.redisService.client.set(key, JSON.stringify(data), 'EX', ttl);
    } catch (error) {
      this.logger.error(`Failed to set cache ${key}: ${error.message}`);
    }
  }
}
