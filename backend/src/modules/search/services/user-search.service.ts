import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike, DataSource } from 'typeorm';
import { UserRepository } from '../../user/repositories/user.repository';
import { FollowRepository } from '../../user/repositories/follow.repository';
import { PrivacyService } from '../../privacy/services/privacy.service';
import { UserSearchHistoryEntity } from '../entities/user-search-history.entity';
import { UserProfileEntity } from '../../user/entities/user-profile.entity';
import { RedisService } from '../../redis/redis-core.service';

export interface UserSearchQueryDto {
  q?: string;
  query?: string;
  limit?: number;
  cursor?: string;
  filter?: string; // 'all' | 'explorers' | 'hosts' | 'mutuals'
}

@Injectable()
export class UserSearchService {
  private readonly logger = new Logger(UserSearchService.name);
  private readonly queryCache = new Map<
    string,
    { timestamp: number; data: { items: any[]; nextCursor?: string } }
  >();
  private readonly CACHE_TTL_MS = 45 * 1000; // 45 seconds short-lived cache

  constructor(
    private readonly userRepository: UserRepository,
    private readonly followRepository: FollowRepository,
    private readonly privacyService: PrivacyService,
    @InjectRepository(UserSearchHistoryEntity)
    private readonly historyRepo: Repository<UserSearchHistoryEntity>,
    private readonly dataSource: DataSource,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Enterprise multi-field user search with relevance ranking and privacy filtering.
   */
  async searchUsers(
    userId: string,
    dto: UserSearchQueryDto,
  ): Promise<{ items: any[]; nextCursor?: string }> {
    const searchQuery = (dto.q || dto.query || '').trim().toLowerCase();
    const limit = 10; // Hard limit mandated by requirements
    const offset = dto.cursor ? parseInt(dto.cursor, 10) || 0 : 0;

    // Check short-lived cache in Redis for popular/repeated queries
    const cacheKey = `search:${searchQuery}_${dto.filter || 'all'}_${limit}_${offset}`;
    if (searchQuery.length >= 2) {
      try {
        const cached = await this.redisService.client.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {
        this.logger.warn(`Redis cache fetch failed: ${e.message}`);
      }
    }

    // Record search history if query is meaningful
    if (searchQuery.length >= 2 && offset === 0) {
      try {
        await this.historyRepo.save({
          userId,
          query: searchQuery,
          filters: { filter: dto.filter },
        });
      } catch (e) {
        this.logger.warn(`Failed to save search history: ${e.message}`);
      }
    }

    // Get blocked users
    let blockedIds = new Set<string>();
    try {
      const blockedList = await this.privacyService.getBlockedUsers(userId);
      blockedIds = new Set(blockedList.items.map((u) => u.targetUserId));
    } catch (e) {
      this.logger.warn(`Could not fetch blocked users: ${e.message}`);
    }

    const excludeUserIds = [userId, ...Array.from(blockedIds)];

    // Enterprise Semantic DB Search (fetch pool for ranking)
    const dbProfiles = await this.userRepository.searchActiveProfiles(
      searchQuery,
      50, // Fetch top 50 for JS ranking pool
      0,
      excludeUserIds,
    );

    // Advanced JS re-ranking
    let totalRanked = dbProfiles;
    if (searchQuery) {
      const tokens = searchQuery.split(/\s+/);
      const scored = dbProfiles.map((u) => {
        let score = u.reputationScore; // Baseline
        const uname = u.username.toLowerCase();
        const dname = u.displayName.toLowerCase();

        // Exact Matches
        if (uname === searchQuery) score += 10000;
        else if (dname === searchQuery) score += 9000;
        // Prefix Matches
        else if (uname.startsWith(searchQuery) || dname.startsWith(searchQuery)) score += 5000;
        // Token Prefix matches
        else if (tokens.some((t) => uname.includes(t) || dname.includes(t))) score += 3000;
        // Infix / Substring Matches
        else if (uname.includes(searchQuery) || dname.includes(searchQuery)) score += 1000;

        return { profile: u, score };
      });
      scored.sort((a, b) => b.score - a.score);
      totalRanked = scored.map((item) => item.profile);
    }

    const hasMore = offset + limit < totalRanked.length;
    const slice = totalRanked.slice(offset, offset + limit);

    const result = {
      items: this.mapToDto(slice),
      nextCursor: hasMore ? (offset + limit).toString() : undefined,
    };

    if (searchQuery.length >= 2) {
      try {
        await this.redisService.client.set(
          cacheKey,
          JSON.stringify(result),
          'PX',
          this.CACHE_TTL_MS,
        );
      } catch (e) {
        this.logger.warn(`Redis cache set failed: ${e.message}`);
      }
    }

    return result;
  }

  /**
   * Get recent search history for the user
   */
  async getSearchHistory(userId: string, limit = 10): Promise<any[]> {
    const history = await this.historyRepo.find({
      where: { userId },
      order: { searchedAt: 'DESC' },
      take: limit,
    });
    return history;
  }

  private mapToDto(profiles: UserProfileEntity[]): any[] {
    return profiles.map((p) => ({
      userId: p.userId,
      username: p.username,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl || null,
      level: p.level,
      reputationScore: p.reputationScore,
      locationFormatted: p.locationFormatted || 'Bangalore, India',
      bio: p.bio || 'Passionate explorer chasing scenic trails.',
      compatibility: Math.min(98, 70 + p.level * 3),
    }));
  }

  /**
   * Search for members within a specific community.
   */
  async searchCommunityMembers(
    communityId: string,
    userId: string,
    dto: UserSearchQueryDto,
  ): Promise<{ items: any[]; nextCursor?: string }> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        communityId,
      );
    if (!isUuid) {
      const comm = await this.dataSource
        .getRepository('communities')
        .findOne({ where: { slug: communityId }, select: ['id'] });
      if (!comm) return { items: [] };
      communityId = comm.id;
    }
    const searchQuery = (dto.q || dto.query || '').trim().toLowerCase();
    const limit = Number(dto.limit) || 20;
    const offset = dto.cursor ? parseInt(dto.cursor, 10) || 0 : 0;

    let queryBuilder = this.dataSource
      .createQueryBuilder()
      .select([
        'cm.id',
        'cm.roleId',
        'cm.isOwner',
        'cm.isMuted',
        'cm.joinedAt',
        'cm.status',
      ])
      .addSelect([
        'up.userId',
        'up.username',
        'up.displayName',
        'up.avatarUrl',
        'up.level',
        'cr.name as "roleName"',
      ])
      .from('community_members', 'cm')
      .innerJoin('users_profile', 'up', 'cm.userId = up.userId')
      .leftJoin('community_roles', 'cr', 'cm.roleId = cr.id')
      .where('cm.communityId = :communityId', { communityId })
      .andWhere("cm.status = 'ACTIVE'");

    if (searchQuery) {
      queryBuilder = queryBuilder.andWhere(
        '(LOWER(up.username) LIKE :q OR LOWER(up.displayName) LIKE :q OR LOWER(cm.nickname) LIKE :q)',
        { q: `%${searchQuery}%` },
      );
    }

    const members = await queryBuilder
      .orderBy('cm.joinedAt', 'ASC')
      .limit(limit + 1)
      .offset(offset)
      .getRawMany();

    const hasMore = members.length > limit;
    const slice = hasMore ? members.slice(0, limit) : members;

    return {
      items: slice.map((m) => ({
        id: m.cm_id,
        userId: m.up_userId,
        username: m.up_username,
        displayName: m.up_displayName,
        avatarUrl: m.up_avatarUrl,
        level: m.up_level,
        roleId: m.cm_roleId,
        roleName: m.roleName,
        isOwner: m.cm_isOwner,
        isMuted: m.cm_isMuted,
        status: m.cm_status,
        joinedAt: m.cm_joinedAt,
        user: {
          id: m.up_userId,
          username: m.up_username,
          displayName: m.up_displayName,
          avatarUrl: m.up_avatarUrl,
        },
      })),
      nextCursor: hasMore ? (offset + limit).toString() : undefined,
    };
  }
}
