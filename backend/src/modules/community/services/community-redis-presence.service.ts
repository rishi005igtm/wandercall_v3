import { Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import { RedisService } from '../../redis/redis-core.service';
import { COMMUNITY_RANKING_CONFIG } from '../config/community-ranking.config';

export interface ActiveCohortUser {
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  roleName: string;
  isGuest?: boolean;
  status?: string;
  currentActivity?: string;
  joinTime?: number;
  connectionQuality?: 'Excellent' | 'Good' | 'Fair';
  isTyping?: boolean;
}

@Injectable()
export class CommunityRedisPresenceService implements OnModuleInit {
  private readonly logger = new Logger(CommunityRedisPresenceService.name);

  // Fallback in-memory structures if Upstash/Redis connection is pending
  private readonly fallbackOnlineMap = new Map<string, Set<string>>();
  private readonly fallbackCohorts = new Map<string, Map<string, ActiveCohortUser>>();

  constructor(@Optional() private readonly redisService?: RedisService) {}

  onModuleInit() {
    if (this.redisService) {
      this.logger.log('CommunityRedisPresenceService initialized with Enterprise Redis Storage (Sorted Sets, Sets, TTL)');
    } else {
      this.logger.warn('RedisService not injected. Using high-performance in-memory presence fallback.');
    }
  }

  /**
   * Registers a user or guest joining a community presence session / active cohort.
   * Updates Redis Sets, Sorted Sets, and sets heartbeat TTL.
   */
  async enterPresenceSession(communityId: string, user: ActiveCohortUser, socketId?: string): Promise<number> {
    const ttl = COMMUNITY_RANKING_CONFIG.thresholds.presenceTtlSeconds;
    const client = this.redisService?.client;

    if (client && client.status === 'ready') {
      try {
        const userKey = `presence:user:${user.userId}`;
        const onlineSetKey = `presence:community:${communityId}:online`;
        const cohortHashKey = `presence:room:community:${communityId}:cohorts`;
        const rankingZSetKey = `presence:community:ranking:online`;

        // 1. Update user presence TTL
        await client.hset(userKey, {
          status: user.status || 'Active Now',
          lastSeen: Date.now().toString(),
          currentCommunityId: communityId,
        });
        await client.expire(userKey, ttl);

        // 2. Add user to community online set
        await client.sadd(onlineSetKey, user.userId);
        await client.expire(onlineSetKey, ttl * 10); // Keep set active longer than individual sessions

        // 3. Store active cohort user payload in room hash
        await client.hset(cohortHashKey, user.userId, JSON.stringify(user));

        // 4. Update online count in Sorted Set without scanning keys
        const count = await client.scard(onlineSetKey);
        await client.zadd(rankingZSetKey, count, communityId);

        return count;
      } catch (err: any) {
        this.logger.error(`Redis enterPresenceSession error: ${err.message}. Falling back to memory.`);
      }
    }

    // In-memory fallback
    if (!this.fallbackOnlineMap.has(communityId)) {
      this.fallbackOnlineMap.set(communityId, new Set());
    }
    this.fallbackOnlineMap.get(communityId)!.add(user.userId);

    if (!this.fallbackCohorts.has(communityId)) {
      this.fallbackCohorts.set(communityId, new Map());
    }
    this.fallbackCohorts.get(communityId)!.set(user.userId, user);

    return this.fallbackOnlineMap.get(communityId)!.size;
  }

  /**
   * Removes a user session when they leave or disconnect.
   */
  async leavePresenceSession(communityId: string, userId: string): Promise<number> {
    const client = this.redisService?.client;

    if (client && client.status === 'ready') {
      try {
        const onlineSetKey = `presence:community:${communityId}:online`;
        const cohortHashKey = `presence:room:community:${communityId}:cohorts`;
        const rankingZSetKey = `presence:community:ranking:online`;

        await client.srem(onlineSetKey, userId);
        await client.hdel(cohortHashKey, userId);

        const count = await client.scard(onlineSetKey);
        if (count <= 0) {
          await client.zrem(rankingZSetKey, communityId);
        } else {
          await client.zadd(rankingZSetKey, count, communityId);
        }
        return count;
      } catch (err: any) {
        this.logger.error(`Redis leavePresenceSession error: ${err.message}. Falling back to memory.`);
      }
    }

    // In-memory fallback
    const onlineSet = this.fallbackOnlineMap.get(communityId);
    if (onlineSet) {
      onlineSet.delete(userId);
    }
    const cohortMap = this.fallbackCohorts.get(communityId);
    if (cohortMap) {
      cohortMap.delete(userId);
    }
    return onlineSet ? onlineSet.size : 0;
  }

  /**
   * Heartbeat pulse to refresh TTL and keep session active without polling
   */
  async pulseHeartbeat(communityId: string, userId: string): Promise<boolean> {
    const ttl = COMMUNITY_RANKING_CONFIG.thresholds.presenceTtlSeconds;
    const client = this.redisService?.client;

    if (client && client.status === 'ready') {
      try {
        const userKey = `presence:user:${userId}`;
        const onlineSetKey = `presence:community:${communityId}:online`;
        await client.expire(userKey, ttl);
        await client.expire(onlineSetKey, ttl * 10);
        return true;
      } catch (e) {
        // ignore
      }
    }
    return true;
  }

  /**
   * Retrieves current online count for a community in O(1)
   */
  async getOnlineCount(communityId: string): Promise<number> {
    const client = this.redisService?.client;
    if (client && client.status === 'ready') {
      try {
        const count = await client.scard(`presence:community:${communityId}:online`);
        return count;
      } catch (e) {
        // ignore
      }
    }
    return this.fallbackOnlineMap.get(communityId)?.size || 0;
  }

  /**
   * Retrieves active cohort details (including guests)
   */
  async getActiveCohorts(communityId: string): Promise<ActiveCohortUser[]> {
    const client = this.redisService?.client;
    if (client && client.status === 'ready') {
      try {
        const cohortHashKey = `presence:room:community:${communityId}:cohorts`;
        const rawValues = await client.hvals(cohortHashKey);
        return rawValues.map(v => JSON.parse(v));
      } catch (e) {
        // ignore
      }
    }
    const map = this.fallbackCohorts.get(communityId);
    return map ? Array.from(map.values()) : [];
  }
}
