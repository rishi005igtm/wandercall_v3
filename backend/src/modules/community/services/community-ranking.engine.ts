import { Injectable, Logger } from '@nestjs/common';
import { CommunityEntity } from '../entities/community.entity';
import { COMMUNITY_RANKING_CONFIG } from '../config/community-ranking.config';

export interface CommunityScoringContext {
  onlineMemberCount: number;
  isLive: boolean;
  recentMessageCount?: number;
  growthRatePercent?: number;
  friendCount?: number;
  distanceKm?: number;
  trendingScore?: number;
}

@Injectable()
export class CommunityRankingEngine {
  private readonly logger = new Logger(CommunityRankingEngine.name);

  /**
   * Computes multi-signal recommendation ranking score using configurable weights.
   * No hardcoded ranking.
   */
  scoreCommunity(community: CommunityEntity, context: CommunityScoringContext): {
    recommendationScore: number;
    breakdown: Record<string, number>;
  } {
    const weights = COMMUNITY_RANKING_CONFIG.weights;

    // 1. Popularity Score (normalized between 0 and 100 based on member count)
    const members = community.currentMemberCount || 0;
    const popularityScore = Math.min(100, Math.round((members / (members + 50)) * 100));

    // 2. Live Activity Score (100 if campfire/live event active, else 20)
    const liveActivityScore = context.isLive ? 100 : Math.min(60, context.onlineMemberCount * 15);

    // 3. Online Members Score (logarithmic scaling of real-time active users)
    const onlineScore = Math.min(100, Math.round(Math.log2((context.onlineMemberCount || 0) + 1) * 25));

    // 4. Recent Messages Score (chat velocity normalized)
    const recentMessages = context.recentMessageCount || 0;
    const recentMessagesScore = Math.min(100, Math.round((recentMessages / (recentMessages + 20)) * 100));

    // 5. Growth Velocity Score
    const growth = context.growthRatePercent || 5;
    const growthScore = Math.min(100, Math.max(0, Math.round(growth * 4)));

    // 6. Friend Presence Score (high boost if friends are currently inside)
    const friends = context.friendCount || 0;
    const friendScore = Math.min(100, friends * 33);

    // 7. Distance Proximity Score (inverse decay with distance)
    const dist = context.distanceKm !== undefined ? context.distanceKm : COMMUNITY_RANKING_CONFIG.thresholds.defaultRadiusKm;
    const distanceScore = Math.max(10, Math.round(100 * Math.exp(-0.02 * dist)));

    // 8. Trending Score
    const trendingScore = context.trendingScore || Math.round((liveActivityScore + onlineScore) / 2);

    // Compute weighted sum
    const totalScore = Math.round(
      popularityScore * weights.popularity +
      liveActivityScore * weights.liveActivity +
      onlineScore * weights.onlineMembers +
      recentMessagesScore * weights.recentMessages +
      growthScore * weights.growth +
      friendScore * weights.friendPresence +
      distanceScore * weights.distance +
      trendingScore * weights.trending
    );

    return {
      recommendationScore: Math.max(1, Math.min(100, totalScore)),
      breakdown: {
        popularityScore,
        liveActivityScore,
        onlineScore,
        recentMessagesScore,
        growthScore,
        friendScore,
        distanceScore,
        trendingScore,
      },
    };
  }
}
