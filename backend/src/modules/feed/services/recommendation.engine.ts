import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { InteractionRepository } from '../repositories/interaction.repository';
import { RankingEngine } from './ranking.engine';
import { InterestEngine } from './interest.engine';
import { FollowRepository } from '../../user/repositories/follow.repository';
import { UserRepository } from '../../user/repositories/user.repository';
import { RANKING_CONFIG } from '../config/ranking.config';
import { PostEntity } from '../entities/post.entity';

export interface FeedQueryDto {
  feedType?: 'global' | 'following' | 'trending' | 'recent' | 'category' | 'saved' | 'host';
  category?: string;
  limit?: number;
  cursor?: string;
}

interface FeedCursor {
  timestamp: number;
  offset: number;
  feedType: string;
  category?: string;
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
  ): Promise<{ items: any[]; nextCursor?: string }> {
    const feedType = query.feedType || 'global';
    const limit = Number(query.limit) || 10;
    
    // 1. Parse or initialize stable cursor to prevent duplicates on scrolling
    let cursor: FeedCursor;
    if (query.cursor) {
      try {
        cursor = JSON.parse(Buffer.from(query.cursor, 'base64').toString('ascii'));
      } catch (err) {
        this.logger.warn(`Failed to parse feed cursor: ${query.cursor}, fallback to defaults`);
        cursor = { timestamp: Date.now(), offset: 0, feedType };
      }
    } else {
      cursor = { timestamp: Date.now(), offset: 0, feedType, category: query.category };
    }

    this.logger.log(`Generating feed: type=${feedType}, viewer=${viewerId}, offset=${cursor.offset}`);

    // 2. Fetch context information (follows, interests, impressions)
    let followedCreatorIds: string[] = [];
    const followedSet = new Set<string>();
    const seenSet = new Set<string>();
    let userInterests: Record<string, number> = {};

    if (viewerId) {
      // Fetch followed creators
      const followingResult = await this.followRepository.getFollowing(viewerId, 1000);
      followedCreatorIds = followingResult.items.map((item) => item.profile.userId);
      for (const id of followedCreatorIds) {
        followedSet.add(id);
      }

      // Fetch user impressions history to apply seen fatigue penalty
      const impressionsList = await this.interactionRepo.getImpressions(viewerId);
      for (const postId of impressionsList) {
        seenSet.add(postId);
      }

      // Fetch interest affinities
      userInterests = await this.interestEngine.getUserInterestMap(viewerId);
    }

    // 3. Candidate Generation
    let candidates = await this.postRepository.getCandidates(viewerId || undefined, followedCreatorIds);

    // Apply strict filters based on feed type
    if (feedType === 'following') {
      // Filter candidates to only followed creators
      candidates = candidates.filter((c) => followedSet.has(c.authorId) || c.authorId === viewerId);
    } else if (feedType === 'category' && query.category) {
      if (query.category === 'experience') {
        const experienceCategories = ['story', 'itinerary', 'stay', 'review', 'tips', 'food', 'budget', 'meetup'];
        candidates = candidates.filter((c) => experienceCategories.includes(c.category));
      } else if (query.category === 'memory') {
        candidates = candidates.filter((c) => c.category === 'memory' || c.category === 'memories');
      } else {
        candidates = candidates.filter((c) => c.category === query.category);
      }
    } else if (feedType === 'saved') {
      if (viewerId) {
        const saves = await this.interactionRepo.findSavesByUserId(viewerId);
        const savedPostIds = new Set(saves.map((s) => s.postId));
        candidates = candidates.filter((c) => savedPostIds.has(c.id));
      } else {
        candidates = [];
      }
    } else if (feedType === 'host') {
      candidates = candidates.filter((c) => c.authorType === 'HOST');
    }

    // 4. Scoring candidates using stable query reference timestamp
    const scoredCandidates = candidates.map((post) => {
      const score = this.scorePostWithCustomTime(
        post,
        cursor.timestamp,
        viewerId,
        userInterests,
        followedSet,
        seenSet,
        feedType === 'trending', // Emphasize trending signals if requested
      );
      return { post, score };
    });

    // Sort by computed score descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    // 5. Apply Creator and Category Diversity Re-ranking
    const finalScoredList = this.applyDiversityReRanking(scoredCandidates);

    // 6. Slice page of results
    const paginatedSlice = finalScoredList.slice(cursor.offset, cursor.offset + limit);
    const hasMore = finalScoredList.length > cursor.offset + limit;

    // 7. Batch retrieve and stitch creator profiles (Avoid N+1 queries)
    const authorIds = [...new Set(paginatedSlice.map((item) => item.post.authorId))];
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

    // Stitch together final user payload
    const items = paginatedSlice.map((item) => {
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
        author: {
          id: item.post.authorId,
          type: item.post.authorType,
          ...authorProfile,
        },
        recommendationScore: item.score,
      };
    });

    // 8. Generate next base64 cursor
    let nextCursor: string | undefined;
    if (hasMore) {
      const nextCursorObj: FeedCursor = {
        timestamp: cursor.timestamp,
        offset: cursor.offset + limit,
        feedType,
        category: query.category,
      };
      nextCursor = Buffer.from(JSON.stringify(nextCursorObj)).toString('base64');
    }

    return { items, nextCursor };
  }

  /**
   * Scorer utility using reference time instead of current millis to ensure sorting is stable across paginations.
   */
  private scorePostWithCustomTime(
    post: PostEntity,
    referenceTime: number,
    viewerId: string | null,
    userInterests: Record<string, number>,
    followedCreatorIds: Set<string>,
    seenPostIds: Set<string>,
    isTrendingOnly: boolean,
  ): number {
    const publishedAt = post.publishedAt || post.createdAt;
    const diffMs = Math.max(0, referenceTime - publishedAt.getTime());
    const daysElapsed = diffMs / (1000 * 60 * 60 * 24);
    
    // Freshness factor
    const freshnessScore = Math.exp(-RANKING_CONFIG.freshness.decayRate * daysElapsed);

    // Engagement score (normalised sigmoidal)
    const baseEngagement =
      post.likeCount * RANKING_CONFIG.engagementMultipliers.like +
      post.commentCount * RANKING_CONFIG.engagementMultipliers.comment +
      post.saveCount * RANKING_CONFIG.engagementMultipliers.save +
      post.shareCount * RANKING_CONFIG.engagementMultipliers.share;
    
    const engagementScore = baseEngagement > 0 ? baseEngagement / (baseEngagement + 15.0) : 0;

    // Category Interest affinity
    const rawInterest = userInterests[post.category] || 0.0;
    const interestScore = rawInterest > 0 ? rawInterest / (rawInterest + 5.0) : 0.0;

    // Follow relationships
    const isFollowing = followedCreatorIds.has(post.authorId);
    const relationshipScore = isFollowing ? 1.0 : 0.0;

    let score = 0.0;

    if (isTrendingOnly) {
      // Trending emphasizes recent high-engagement posts
      // Score is dominated by engagement speed (engagementScore * freshnessScore)
      score = engagementScore * 0.7 + freshnessScore * 0.3;
    } else if (viewerId) {
      score =
        interestScore * RANKING_CONFIG.weights.interest +
        relationshipScore * RANKING_CONFIG.weights.relationship +
        freshnessScore * RANKING_CONFIG.weights.freshness +
        engagementScore * RANKING_CONFIG.weights.engagement;
    } else {
      score = freshnessScore * 0.5 + engagementScore * 0.5;
    }

    // Apply seen fatigue multiplier
    if (viewerId && seenPostIds.has(post.id)) {
      score *= RANKING_CONFIG.penalties.seen;
    }

    // Apply quality multiplier
    score *= (post.aiQualityScore || 1.0);

    return score;
  }

  /**
   * Apply creator and category diversity rules to demote repetitive creators or categories.
   */
  private applyDiversityReRanking(
    candidates: { post: PostEntity; score: number }[],
  ): { post: PostEntity; score: number }[] {
    const list: { post: PostEntity; score: number }[] = [];
    const pool = [...candidates];

    // Maintain tracking window of last added entries to ensure diversity
    const creatorWindow: string[] = [];
    const categoryWindow: string[] = [];

    while (pool.length > 0) {
      let bestIdx = 0;
      let bestScore = -9999;

      for (let i = 0; i < pool.length; i++) {
        let candidateScore = pool[i].score;
        const authorId = pool[i].post.authorId;
        const category = pool[i].post.category;

        // Apply diversity penalties relative to sliding window
        // Demote if matches last creator
        if (creatorWindow.length > 0 && creatorWindow[creatorWindow.length - 1] === authorId) {
          candidateScore *= RANKING_CONFIG.penalties.consecutiveCreator;
        }

        // Demote if matches last 2 categories
        if (categoryWindow.length >= 2 && 
            categoryWindow[categoryWindow.length - 1] === category && 
            categoryWindow[categoryWindow.length - 2] === category) {
          candidateScore *= RANKING_CONFIG.penalties.consecutiveCategory;
        }

        if (candidateScore > bestScore) {
          bestScore = candidateScore;
          bestIdx = i;
        }
      }

      // Add selected item to list and update tracking windows
      const chosen = pool.splice(bestIdx, 1)[0];
      list.push(chosen);

      creatorWindow.push(chosen.post.authorId);
      categoryWindow.push(chosen.post.category);

      // Keep windows capped
      if (creatorWindow.length > 5) creatorWindow.shift();
      if (categoryWindow.length > 5) categoryWindow.shift();
    }

    return list;
  }

  async getUserFeed(
    viewerId: string | null,
    username: string,
    query: FeedQueryDto,
  ): Promise<{ items: any[]; nextCursor?: string }> {
    const limit = Number(query.limit) || 10;
    
    // Resolve target username
    const cleanUsername = username.replace(/^@/, '').toLowerCase();
    const targetProfile = await this.userRepository.findByUsername(cleanUsername);
    if (!targetProfile) {
      throw new NotFoundException(`User with username '${username}' not found.`);
    }

    const authorId = targetProfile.userId;

    // Check relationship state
    let isFollowing = false;
    if (viewerId && viewerId !== authorId) {
      const follow = await this.followRepository.findOne(viewerId, authorId);
      isFollowing = !!follow;
    }

    // Get posts by author with proper visibility rules applied
    let posts = await this.postRepository.getPostsByAuthor(authorId, viewerId, isFollowing);

    // Apply category filters if requested
    if (query.category) {
      if (query.category === 'experience') {
        const experienceCategories = ['story', 'itinerary', 'stay', 'review', 'tips', 'food', 'budget', 'meetup'];
        posts = posts.filter((c) => experienceCategories.includes(c.category));
      } else if (query.category === 'memory') {
        posts = posts.filter((c) => c.category === 'memory' || c.category === 'memories');
      } else {
        posts = posts.filter((c) => c.category === query.category);
      }
    }

    // Apply pagination offset cursor
    let offset = 0;
    let timestamp = Date.now();
    if (query.cursor) {
      try {
        const cursorObj = JSON.parse(Buffer.from(query.cursor, 'base64').toString('ascii'));
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
      nextCursor = Buffer.from(JSON.stringify(nextCursorObj)).toString('base64');
    }

    return { items, nextCursor };
  }
}
