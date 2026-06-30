import { Injectable, Logger } from '@nestjs/common';
import { PostEntity } from '../entities/post.entity';
import { RANKING_CONFIG } from '../config/ranking.config';

@Injectable()
export class RankingEngine {
  private readonly logger = new Logger(RankingEngine.name);

  /**
   * Compute a personalized recommendation score for a post relative to a viewer.
   */
  scorePost(
    post: PostEntity,
    viewerId?: string,
    userInterests: Record<string, number> = {},
    followedCreatorIds: Set<string> = new Set(),
    seenPostIds: Set<string> = new Set(),
  ): number {
    // 1. Freshness Score (exponential decay)
    const publishedAt = post.publishedAt || post.createdAt;
    const diffMs = Math.max(0, Date.now() - publishedAt.getTime());
    const daysElapsed = diffMs / (1000 * 60 * 60 * 24);
    const freshnessScore = Math.exp(-RANKING_CONFIG.freshness.decayRate * daysElapsed);

    // 2. Engagement Score (normalize via sigmoidal mapping)
    const baseEngagement =
      post.likeCount * RANKING_CONFIG.engagementMultipliers.like +
      post.commentCount * RANKING_CONFIG.engagementMultipliers.comment +
      post.saveCount * RANKING_CONFIG.engagementMultipliers.save +
      post.shareCount * RANKING_CONFIG.engagementMultipliers.share;
    
    // Scale engagement score between 0 and 1 using saturation curve: x / (x + 15)
    const engagementScore = baseEngagement > 0 ? baseEngagement / (baseEngagement + 15.0) : 0;

    // 3. User Interest Score
    const rawInterest = userInterests[post.category] || 0.0;
    // Scale interest score between 0 and 1: x / (x + 5.0)
    const interestScore = rawInterest > 0 ? rawInterest / (rawInterest + 5.0) : 0.0;

    // 4. Relationship Score
    const isFollowingCreator = followedCreatorIds.has(post.authorId);
    const relationshipScore = isFollowingCreator ? 1.0 : 0.0;

    // 5. Aggregate base score
    let score = 0.0;
    if (viewerId) {
      // Personalization weights
      score =
        interestScore * RANKING_CONFIG.weights.interest +
        relationshipScore * RANKING_CONFIG.weights.relationship +
        freshnessScore * RANKING_CONFIG.weights.freshness +
        engagementScore * RANKING_CONFIG.weights.engagement;
    } else {
      // Anonymous Guest: equal balance between fresh content and popular content
      score = freshnessScore * 0.5 + engagementScore * 0.5;
    }

    // 6. Apply seen fatigue (Impression Penalty)
    if (viewerId && seenPostIds.has(post.id)) {
      score *= RANKING_CONFIG.penalties.seen;
    }

    // Boost score slightly by the post's AI quality rating
    score *= (post.aiQualityScore || 1.0);

    return score;
  }
}
