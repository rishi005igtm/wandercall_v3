import { Injectable, Logger } from '@nestjs/common';
import { PostEntity } from '../entities/post.entity';
import { RANKING_CONFIG } from '../config/ranking.config';

export interface ScoringContext {
  viewerId?: string;
  referenceTime?: number;
  userInterests?: Record<string, number>;
  authorAffinityMap?: Record<string, number>;
  followedCreatorIds?: Set<string>;
  impressionCounts?: Record<string, number>;
  hasLiked?: boolean;
  hasSaved?: boolean;
  isExplore?: boolean;
}

@Injectable()
export class RankingEngine {
  private readonly logger = new Logger(RankingEngine.name);

  /**
   * Compute a personalized recommendation score for a post relative to a viewer.
   */
  scorePost(post: PostEntity, context: ScoringContext): number {
    const {
      viewerId,
      referenceTime = Date.now(),
      userInterests = {},
      authorAffinityMap = {},
      followedCreatorIds = new Set(),
      impressionCounts = {},
      hasLiked = false,
      hasSaved = false,
      isExplore = false,
    } = context;

    // 1. Freshness Feature
    const publishedAt = post.publishedAt || post.createdAt;
    const diffMs = Math.max(0, referenceTime - publishedAt.getTime());
    const hoursElapsed = diffMs / (1000 * 60 * 60);
    const daysElapsed = hoursElapsed / 24;
    
    let freshnessScore = Math.exp(-RANKING_CONFIG.freshness.decayRate * daysElapsed);
    
    // New Post Boost
    if (hoursElapsed < RANKING_CONFIG.freshness.newPostWindowHours) {
      freshnessScore *= RANKING_CONFIG.freshness.newPostBoost;
    }

    // 2. Popularity & Engagement Features
    const baseEngagement =
      post.likeCount * RANKING_CONFIG.engagementMultipliers.like +
      post.commentCount * RANKING_CONFIG.engagementMultipliers.comment +
      post.saveCount * RANKING_CONFIG.engagementMultipliers.save +
      post.shareCount * RANKING_CONFIG.engagementMultipliers.share;
    
    const popularityScore = baseEngagement > 0 ? baseEngagement / (baseEngagement + 15.0) : 0;

    // 3. Affinity Features
    const rawInterest = userInterests[post.category] || 0.0;
    const interestScore = rawInterest > 0 ? rawInterest / (rawInterest + 5.0) : 0.0;

    const rawAuthorAffinity = authorAffinityMap[post.authorId] || 0.0;
    const authorAffinityScore = rawAuthorAffinity > 0 ? rawAuthorAffinity / (rawAuthorAffinity + 5.0) : 0.0;

    const relationshipScore = followedCreatorIds.has(post.authorId) ? 1.0 : 0.0;

    // 4. Base Score Aggregation
    let score = 0.0;
    if (viewerId) {
      score =
        interestScore * RANKING_CONFIG.weights.interest +
        relationshipScore * RANKING_CONFIG.weights.following +
        freshnessScore * RANKING_CONFIG.weights.freshness +
        popularityScore * RANKING_CONFIG.weights.popularity +
        authorAffinityScore * RANKING_CONFIG.weights.authorAffinity;
    } else {
      score = freshnessScore * 0.4 + popularityScore * 0.6;
    }

    // Exploration Boost
    if (isExplore) {
      score += RANKING_CONFIG.weights.diversityBoost; 
    }

    // AI Quality Modifier
    score += (post.aiQualityScore || 1.0) * RANKING_CONFIG.weights.aiQuality;

    // 5. Seen Penalty Engine (Stage 6)
    const views = impressionCounts[post.id] || 0;
    let seenPenalty = 1.0;
    
    if (views === 1) seenPenalty = RANKING_CONFIG.penalties.seen1x;
    else if (views === 2) seenPenalty = RANKING_CONFIG.penalties.seen2x;
    else if (views === 3) seenPenalty = RANKING_CONFIG.penalties.seen3x;
    else if (views >= 4) seenPenalty = RANKING_CONFIG.penalties.seen4xPlus;

    // Reduce penalty if user interacted with it
    if (hasLiked || hasSaved) {
      seenPenalty = Math.min(1.0, seenPenalty * 2.0); // Halve the penalty
    }

    score *= seenPenalty;

    return score;
  }
}
