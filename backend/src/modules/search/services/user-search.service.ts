import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { UserRepository } from '../../user/repositories/user.repository';
import { FollowRepository } from '../../user/repositories/follow.repository';
import { PrivacyService } from '../../privacy/services/privacy.service';
import { UserSearchHistoryEntity } from '../entities/user-search-history.entity';
import { UserProfileEntity } from '../../user/entities/user-profile.entity';

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
  private readonly queryCache = new Map<string, { timestamp: number; data: { items: any[]; nextCursor?: string } }>();
  private readonly CACHE_TTL_MS = 45 * 1000; // 45 seconds short-lived cache

  constructor(
    private readonly userRepository: UserRepository,
    private readonly followRepository: FollowRepository,
    private readonly privacyService: PrivacyService,
    @InjectRepository(UserSearchHistoryEntity)
    private readonly historyRepo: Repository<UserSearchHistoryEntity>,
  ) {}

  /**
   * Enterprise multi-field user search with relevance ranking and privacy filtering.
   */
  async searchUsers(
    userId: string,
    dto: UserSearchQueryDto,
  ): Promise<{ items: any[]; nextCursor?: string }> {
    const searchQuery = (dto.q || dto.query || '').trim().toLowerCase();
    const limit = Number(dto.limit) || 20;
    const offset = dto.cursor ? parseInt(dto.cursor, 10) || 0 : 0;

    // Check short-lived cache for popular/repeated queries
    const cacheKey = `${searchQuery}_${dto.filter || 'all'}_${limit}_${offset}`;
    if (searchQuery.length >= 2) {
      const now = Date.now();
      const cached = this.queryCache.get(cacheKey);
      if (cached && now - cached.timestamp < this.CACHE_TTL_MS) {
        this.logger.debug(`Cache HIT for query "${searchQuery}" (${cacheKey})`);
        return cached.data;
      }
    }

    this.logger.log(`User ${userId} searching for "${searchQuery}" (limit=${limit}, offset=${offset})`);

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
      blockedIds = new Set(blockedList.items.map(u => u.targetUserId));
    } catch (e) {
      this.logger.warn(`Could not fetch blocked users: ${e.message}`);
    }

    const excludeUserIds = [userId, ...Array.from(blockedIds)];
    
    // Enterprise Semantic DB Search (ILIKE matching across fields)
    const dbProfiles = await this.userRepository.searchActiveProfiles(searchQuery, limit + 1, offset, excludeUserIds);
    
    const hasMore = dbProfiles.length > limit;
    let slice = hasMore ? dbProfiles.slice(0, limit) : dbProfiles;

    // Optional JS re-ranking for exact/prefix matches to boost them above partial ILIKE matches
    if (searchQuery) {
      const scored = slice.map(u => {
        let score = u.reputationScore; // Baseline
        const uname = u.username.toLowerCase();
        const dname = u.displayName.toLowerCase();
        
        if (uname === searchQuery) score += 1000;
        else if (uname.startsWith(searchQuery)) score += 500;
        
        if (dname === searchQuery) score += 900;
        else if (dname.startsWith(searchQuery)) score += 450;
        
        return { profile: u, score };
      });
      scored.sort((a, b) => b.score - a.score);
      slice = scored.map(item => item.profile);
    }

    const result = {
      items: this.mapToDto(slice),
      nextCursor: hasMore ? (offset + limit).toString() : undefined,
    };

    if (searchQuery.length >= 2) {
      const now = Date.now();
      this.queryCache.set(cacheKey, { timestamp: now, data: result });
      if (this.queryCache.size > 500) {
        for (const [key, entry] of this.queryCache.entries()) {
          if (now - entry.timestamp >= this.CACHE_TTL_MS) {
            this.queryCache.delete(key);
          }
        }
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
    return profiles.map(p => ({
      userId: p.userId,
      username: p.username,
      displayName: p.displayName,
      avatarUrl: p.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      level: p.level,
      reputationScore: p.reputationScore,
      locationFormatted: p.locationFormatted || 'Bangalore, India',
      bio: p.bio || 'Passionate explorer chasing scenic trails.',
      compatibility: Math.min(98, 70 + (p.level * 3)),
    }));
  }
}
