import { Injectable } from '@nestjs/common';
import { CampfireEntity } from '../entities/campfire.entity';
import { CampfireRankingService } from './campfire-ranking.service';

@Injectable()
export class CampfireRecommendationService {
  constructor(private readonly rankingService: CampfireRankingService) {}

  /**
   * Calculate a recommendation score for a user.
   * This is the foundation for future ML models.
   * Currently, it uses a heuristic approach based on user context.
   */
  async scoreForUser(campfire: CampfireEntity, userId: string, userContext?: any): Promise<number> {
    // Start with the base popularity score
    let baseScore = this.rankingService.calculatePopularityScore(campfire);

    // Apply personalization multipliers
    let multiplier = 1.0;

    if (userContext) {
      // 1. Community Affinity: User is in the community hosting the campfire
      if (userContext.joinedCommunityIds?.includes(campfire.communityId)) {
        multiplier += 0.5;
      }

      // 2. Category Affinity: User frequently joins campfires of this category
      if (userContext.favoriteCategories?.includes(campfire.category)) {
        multiplier += 0.3;
      }

      // 3. Social Graph: User follows the host or is friends with them
      if (userContext.friendIds?.includes(campfire.hostId) || userContext.followingIds?.includes(campfire.hostId)) {
        multiplier += 0.8;
      }
    }

    return baseScore * multiplier;
  }

  /**
   * Sorts a list of campfires based on the recommendation score for a user.
   */
  async sortForUser(campfires: CampfireEntity[], userId: string, userContext?: any): Promise<CampfireEntity[]> {
    const scoredCampfires = await Promise.all(
      campfires.map(async (campfire) => {
        const score = await this.scoreForUser(campfire, userId, userContext);
        return { campfire, score };
      })
    );

    // Sort descending by score
    scoredCampfires.sort((a, b) => b.score - a.score);

    return scoredCampfires.map((sc) => sc.campfire);
  }
}
