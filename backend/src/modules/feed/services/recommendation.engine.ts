import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PostRepository } from '../repositories/post.repository';
import { InteractionRepository } from '../repositories/interaction.repository';
import { RankingEngine } from './ranking.engine';
import { InterestEngine } from './interest.engine';
import { FollowRepository } from '../../user/repositories/follow.repository';
import { UserRepository } from '../../user/repositories/user.repository';
import { RANKING_CONFIG } from '../config/ranking.config';
import { PostEntity } from '../entities/post.entity';

export interface FeedQueryDto {
  feedType?:
    | 'global'
    | 'following'
    | 'trending'
    | 'recent'
    | 'category'
    | 'saved'
    | 'host'
    | 'explore';
  category?: string;
  limit?: number;
  cursor?: string;
  feedSessionId?: string; // Stage 11: Feed Session Stability
}

export interface FeedItemDto {
  id: string;
  category: string;
  title?: string;
  content?: string;
  images: string[];
  imagePublicIds: string[];
  audioUrl?: string;
  audioDuration?: number;
  locationName?: string;
  locationLat?: number;
  locationLon?: number;
  visibility: string;
  status: string;
  likeCount: number;
  commentCount: number;
  saveCount: number;
  shareCount: number;
  aiQualityScore: number;
  publishedAt: Date;
  createdAt: Date;
  hasLiked?: boolean;
  hasSaved?: boolean;
  author: Record<string, unknown>;
  recommendationScore: number;
}

interface FeedCursor {
  timestamp: number;
  offset: number;
  feedType: string;
  category?: string;
  feedSessionId?: string;
}

@Injectable()
export class RecommendationEngine {
  private readonly logger = new Logger(RecommendationEngine.name);

  constructor(
    private readonly postRepository: PostRepository,
    private readonly interactionRepo: InteractionRepository,
    private readonly rankingEngine: RankingEngine,
    private readonly interestEngine: InterestEngine,
    private readonly followRepository: FollowRepository,
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Generates a personalized paginated feed list for a given viewer.
   */
  async getPersonalizedFeed(
    viewerId: string | null,
    query: FeedQueryDto,
  ): Promise<{ items: FeedItemDto[]; nextCursor?: string }> {
    const feedType = query.feedType || 'global';
    const limit = Number(query.limit) || 10;

    // 1. Parse or initialize stable cursor to prevent duplicates on scrolling
    let cursor: FeedCursor;
    if (query.cursor) {
      try {
        cursor = JSON.parse(
          Buffer.from(query.cursor, 'base64').toString('ascii'),
        );
      } catch (err) {
        this.logger.warn(
          `Failed to parse feed cursor: ${query.cursor}, fallback to defaults`,
        );
        cursor = { timestamp: Date.now(), offset: 0, feedType };
      }
    } else {
      cursor = {
        timestamp: Date.now(),
        offset: 0,
        feedType,
        category: query.category,
        feedSessionId: query.feedSessionId || randomUUID(),
      };
    }

    const currentSessionId = query.feedSessionId || cursor.feedSessionId;

    // 2. Fetch context information (follows, interests, impressions)
    let followedCreatorIds: string[] = [];
    const followedSet = new Set<string>();
    const seenSet = new Set<string>();
    const viewCounts = new Map<string, number>();
    let userInterests: Record<string, number> = {};

    if (viewerId) {
      // Fetch followed creators gracefully
      try {
        const followingResult = await this.followRepository.getFollowing(
          viewerId,
          1000,
        );
        followedCreatorIds = followingResult.items.map(
          (item) => item.profile.userId,
        );
        for (const id of followedCreatorIds) {
          followedSet.add(id);
        }
      } catch (err: unknown) {
        this.logger.warn(
          `Failed to fetch follows for user ${viewerId}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // Fetch user impressions history gracefully
      try {
        const impressions = await this.interactionRepo.getImpressions(viewerId);
        for (const imp of impressions) {
          viewCounts.set(imp.postId, imp.impressionCount);
          seenSet.add(imp.postId);
        }
      } catch (err: unknown) {
        this.logger.warn(
          `Failed to fetch impressions for user ${viewerId}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // Fetch interest affinities gracefully
      try {
        userInterests = await this.interestEngine.getUserInterestMap(viewerId);
      } catch (err: unknown) {
        this.logger.warn(
          `Failed to fetch user interests for user ${viewerId}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    let authorAffinityMap: Record<string, number> = {};
    if (viewerId) {
      try {
        authorAffinityMap =
          await this.interestEngine.getUserAuthorAffinityMap(viewerId);
      } catch (err: unknown) {
        this.logger.warn(
          `Failed to fetch author affinity map for user ${viewerId}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // 3. Candidate Generation and Eligibility Filtering
    let candidates = await this.postRepository.getCandidates(
      viewerId || undefined,
      followedCreatorIds,
    );
    candidates = await this.applyEligibilityFilters(
      candidates,
      feedType,
      query.category,
      viewerId,
    );

    // 4. Scoring candidates using stable query reference timestamp (Stage 3 & 4)
    const isExplore = feedType === 'explore';
    const scoredCandidates = candidates.map((post) => {
      const hasLiked = false; // We can pull this from states later or fetch efficiently if needed, but we already have impression logic in the ranking engine. For performance, we can skip fetching full user_post_states for all candidates if not needed, or just use interaction map.
      const hasSaved = false;
      const score = this.rankingEngine.scorePost(post, {
        viewerId: viewerId || undefined,
        referenceTime: cursor.timestamp,
        userInterests,
        authorAffinityMap,
        followedCreatorIds: followedSet,
        impressionCounts: Object.fromEntries(viewCounts),
        hasLiked,
        hasSaved,
        isExplore,
      });
      return { post, score };
    });

    // Sort by computed score descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    // 5. Apply Creator and Category Diversity Re-ranking
    const finalScoredList = this.applyDiversityReRanking(scoredCandidates);

    // 6. Slice page of results
    const paginatedSlice = finalScoredList.slice(
      cursor.offset,
      cursor.offset + limit,
    );
    const hasMore = finalScoredList.length > cursor.offset + limit;

    // 7. Batch retrieve and stitch creator profiles (Avoid N+1 queries)
    const authorIds = [
      ...new Set(paginatedSlice.map((item) => item.post.authorId)),
    ];
    const profilesMap = new Map<string, any>();
    if (authorIds.length > 0) {
      for (const id of authorIds) {
        const profile = await this.userRepository.findByUserId(id);
        if (profile) {
          profilesMap.set(id, {
            userId: profile.userId,
            username: profile.username,
            displayName: profile.displayName,
            avatarUrl: profile.avatarUrl,
            level: profile.level,
            reputationScore: profile.reputationScore,
          });
        }
      }
    }

    const postIds = paginatedSlice.map((item) => item.post.id);
    const likedPostIds = new Set<string>();
    const savedPostIds = new Set<string>();

    if (viewerId && postIds.length > 0) {
      const states = await this.interactionRepo.getUserPostStates(
        viewerId,
        postIds,
      );
      states.forEach((state) => {
        if (state.hasLiked) likedPostIds.add(state.postId);
        if (state.hasSaved) savedPostIds.add(state.postId);
      });
    }

    // Stitch together final user payload using separated mapping function
    const items = this.buildDTOs(
      paginatedSlice,
      profilesMap,
      likedPostIds,
      savedPostIds,
    );

    // 8. Generate next base64 cursor
    let nextCursor: string | undefined;
    if (hasMore) {
      const nextCursorObj: FeedCursor = {
        timestamp: cursor.timestamp,
        offset: cursor.offset + limit,
        feedType,
        category: query.category,
        feedSessionId: currentSessionId,
      };
      nextCursor = Buffer.from(JSON.stringify(nextCursorObj)).toString(
        'base64',
      );
    }

    return { items, nextCursor };
  }

  /**
   * Apply creator and category diversity rules to ensure a balanced feed (Stage 5)
   */
  private applyDiversityReRanking(
    candidates: { post: PostEntity; score: number }[],
  ): { post: PostEntity; score: number }[] {
    const list: { post: PostEntity; score: number }[] = [];
    const pool = [...candidates];

    const maxConsecutiveAuthor =
      RANKING_CONFIG.diversity.maxConsecutiveAuthor || 2;
    const maxConsecutiveCategory =
      RANKING_CONFIG.diversity.maxConsecutiveCategory || 3;

    const creatorWindow: string[] = [];
    const categoryWindow: string[] = [];

    while (pool.length > 0) {
      let bestIdx = -1;
      const fallbackIdx = 0; // If all violate constraints, just take the highest score remaining

      for (let i = 0; i < pool.length; i++) {
        const authorId = pool[i].post.authorId;
        const category = pool[i].post.category;

        // Check if author constraint violated
        let consecutiveAuthors = 0;
        for (let j = creatorWindow.length - 1; j >= 0; j--) {
          if (creatorWindow[j] === authorId) consecutiveAuthors++;
          else break;
        }

        // Check if category constraint violated
        let consecutiveCategories = 0;
        for (let j = categoryWindow.length - 1; j >= 0; j--) {
          if (categoryWindow[j] === category) consecutiveCategories++;
          else break;
        }

        if (
          consecutiveAuthors < maxConsecutiveAuthor &&
          consecutiveCategories < maxConsecutiveCategory
        ) {
          bestIdx = i;
          break; // Found the highest scoring candidate that satisfies constraints (pool is pre-sorted)
        }
      }

      const chosenIdx = bestIdx !== -1 ? bestIdx : fallbackIdx;
      const chosen = pool.splice(chosenIdx, 1)[0];

      list.push(chosen);
      creatorWindow.push(chosen.post.authorId);
      categoryWindow.push(chosen.post.category);

      // Keep windows bounded to prevent memory leaks, we only care about trailing sequence
      if (creatorWindow.length > maxConsecutiveAuthor + 1)
        creatorWindow.shift();
      if (categoryWindow.length > maxConsecutiveCategory + 1)
        categoryWindow.shift();
    }

    return list;
  }

  /**
   * Modularity: Independent Eligibility Filter testing
   */
  public async applyEligibilityFilters(
    candidates: PostEntity[],
    feedType: string,
    category?: string,
    viewerId?: string | null,
  ): Promise<PostEntity[]> {
    if (feedType === 'following') {
      if (viewerId) {
        try {
          const followingResult = await this.followRepository.getFollowing(
            viewerId,
            1000,
          );
          const followedSet = new Set(
            followingResult.items.map((item) => item.profile.userId),
          );
          return candidates.filter(
            (c) => followedSet.has(c.authorId) || c.authorId === viewerId,
          );
        } catch (e) {
          return candidates; // fallback gracefully
        }
      }
    } else if (feedType === 'category' && category) {
      if (category === 'experience') {
        const experienceCategories = [
          'story',
          'itinerary',
          'stay',
          'review',
          'tips',
          'food',
          'budget',
          'meetup',
        ];
        return candidates.filter((c) =>
          experienceCategories.includes(c.category),
        );
      } else if (category === 'memory') {
        return candidates.filter(
          (c) => c.category === 'memory' || c.category === 'memories',
        );
      } else {
        return candidates.filter((c) => c.category === category);
      }
    } else if (feedType === 'saved') {
      if (viewerId && candidates.length > 0) {
        try {
          const postIds = candidates.map((c) => c.id);
          const savedPostIds = new Set<string>();
          const states = await this.interactionRepo.getUserPostStates(
            viewerId,
            postIds,
          );
          states.forEach((state) => {
            if (state.hasSaved) savedPostIds.add(state.postId);
          });
          return candidates.filter((c) => savedPostIds.has(c.id));
        } catch (e) {
          return []; // fallback gracefully
        }
      } else {
        return [];
      }
    } else if (feedType === 'host') {
      return candidates.filter((c) => c.authorType === 'HOST');
    }
    return candidates;
  }

  /**
   * Modularity: Independent DTO Mapping Logic
   */
  public buildDTOs(
    paginatedSlice: { post: PostEntity; score: number }[],
    profilesMap: Map<string, Record<string, unknown>>,
    likedPostIds: Set<string>,
    savedPostIds: Set<string>,
  ): FeedItemDto[] {
    return paginatedSlice.map((item) => {
      const authorProfile = profilesMap.get(item.post.authorId) || {
        username: 'unknown',
        displayName: 'Wanderer',
        avatarUrl: null,
        level: 1,
      };

      return {
        id: item.post.id,
        category: item.post.category,
        title: item.post.title,
        content: item.post.content,
        images: item.post.images || [],
        imagePublicIds: item.post.imagePublicIds || [],
        audioUrl: item.post.audioUrl,
        audioDuration: item.post.audioDuration,
        locationName: item.post.locationName,
        locationLat: item.post.locationLat,
        locationLon: item.post.locationLon,
        visibility: item.post.visibility,
        status: item.post.status,
        likeCount: item.post.likeCount,
        commentCount: item.post.commentCount,
        saveCount: item.post.saveCount,
        shareCount: item.post.shareCount,
        aiQualityScore: item.post.aiQualityScore,
        publishedAt: item.post.publishedAt || item.post.createdAt,
        createdAt: item.post.createdAt,
        hasLiked: likedPostIds.has(item.post.id),
        hasSaved: savedPostIds.has(item.post.id),
        author: {
          id: item.post.authorId,
          type: item.post.authorType,
          ...authorProfile,
        },
        recommendationScore: item.score,
      };
    });
  }

  async getUserFeed(
    viewerId: string | null,
    username: string,
    query: FeedQueryDto,
  ): Promise<{ items: FeedItemDto[]; nextCursor?: string }> {
    const limit = Number(query.limit) || 10;

    // Resolve target username
    const cleanUsername = username.replace(/^@/, '').toLowerCase();
    const targetProfile =
      await this.userRepository.findByUsername(cleanUsername);
    if (!targetProfile) {
      throw new NotFoundException(
        `User with username '${username}' not found.`,
      );
    }

    const authorId = targetProfile.userId;

    // Check relationship state
    let isFollowing = false;
    if (viewerId && viewerId !== authorId) {
      const follow = await this.followRepository.findOne(viewerId, authorId);
      isFollowing = !!follow;
    }

    // Get posts by author with proper visibility rules applied
    let posts = await this.postRepository.getPostsByAuthor(
      authorId,
      viewerId,
      isFollowing,
    );

    // Apply category filters if requested
    if (query.category) {
      if (query.category === 'experience') {
        const experienceCategories = [
          'story',
          'itinerary',
          'stay',
          'review',
          'tips',
          'food',
          'budget',
          'meetup',
        ];
        posts = posts.filter((c) => experienceCategories.includes(c.category));
      } else if (query.category === 'memory') {
        posts = posts.filter(
          (c) => c.category === 'memory' || c.category === 'memories',
        );
      } else {
        posts = posts.filter((c) => c.category === query.category);
      }
    }

    // Apply pagination offset cursor
    let offset = 0;
    let timestamp = Date.now();
    if (query.cursor) {
      try {
        const cursorObj = JSON.parse(
          Buffer.from(query.cursor, 'base64').toString('ascii'),
        );
        offset = Number(cursorObj.offset) || 0;
        timestamp = Number(cursorObj.timestamp) || Date.now();
      } catch (err) {
        this.logger.warn(`Failed to parse user feed cursor: ${query.cursor}`);
      }
    }

    const paginatedSlice = posts.slice(offset, offset + limit);
    const hasMore = posts.length > offset + limit;

    // Stitch target profile metadata
    const authorProfile = {
      userId: targetProfile.userId,
      username: targetProfile.username,
      displayName: targetProfile.displayName,
      avatarUrl: targetProfile.avatarUrl,
      level: targetProfile.level,
      reputationScore: targetProfile.reputationScore,
    };

    const items = paginatedSlice.map((post) => ({
      id: post.id,
      category: post.category,
      title: post.title,
      content: post.content,
      images: post.images || [],
      imagePublicIds: post.imagePublicIds || [],
      audioUrl: post.audioUrl,
      audioDuration: post.audioDuration,
      locationName: post.locationName,
      locationLat: post.locationLat,
      locationLon: post.locationLon,
      visibility: post.visibility,
      status: post.status,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      saveCount: post.saveCount,
      shareCount: post.shareCount,
      aiQualityScore: post.aiQualityScore,
      publishedAt: post.publishedAt || post.createdAt,
      createdAt: post.createdAt,
      author: {
        id: post.authorId,
        type: post.authorType,
        ...authorProfile,
      },
      recommendationScore: 1.0,
    }));

    let nextCursor: string | undefined;
    if (hasMore) {
      const nextCursorObj = {
        timestamp,
        offset: offset + limit,
      };
      nextCursor = Buffer.from(JSON.stringify(nextCursorObj)).toString(
        'base64',
      );
    }

    return { items, nextCursor };
  }
}
