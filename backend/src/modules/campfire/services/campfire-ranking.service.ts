import { Injectable } from '@nestjs/common';
import { CampfireEntity } from '../entities/campfire.entity';

@Injectable()
export class CampfireRankingService {
  /**
   * Calculate a popularity score for a given campfire.
   * Based on current participants, capacity utilization, and recency.
   */
  calculatePopularityScore(campfire: CampfireEntity): number {
    let score = 0;

    // Base score from participants
    score += (campfire.currentListeners * 1) + (campfire.currentSpeakers * 5);

    // Bonus for high capacity utilization (if nearing full, it's popular)
    const utilization = campfire.capacity > 0 ? (campfire.currentListeners + campfire.currentSpeakers) / campfire.capacity : 0;
    if (utilization > 0.8) score += 20;
    else if (utilization > 0.5) score += 10;

    // Recency bonus: newer active campfires get a slight bump
    if (campfire.startedAt) {
      const hoursSinceStart = (Date.now() - campfire.startedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceStart < 1) score += 15;
      else if (hoursSinceStart < 3) score += 5;
    }

    return score;
  }

  /**
   * Calculate a trending score.
   * Trending focuses heavily on velocity (newly started + rapidly growing).
   * For Phase 2, this is a simplified velocity metric.
   */
  calculateTrendingScore(campfire: CampfireEntity): number {
    let score = this.calculatePopularityScore(campfire);

    // Heavily weight recency for trending
    if (campfire.startedAt) {
      const minutesSinceStart = (Date.now() - campfire.startedAt.getTime()) / (1000 * 60);
      
      // If it started in the last 30 mins and has people, it's trending hard
      if (minutesSinceStart < 30) {
        score *= 2.5; 
      } else if (minutesSinceStart < 120) {
        score *= 1.5;
      } else if (minutesSinceStart > 360) {
        // Penalty for very old campfires in the trending view
        score *= 0.5;
      }
    } else {
      // If not started yet, it's not trending
      score = 0;
    }

    return score;
  }
}
