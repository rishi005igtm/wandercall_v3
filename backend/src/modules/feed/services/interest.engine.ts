import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InteractionRepository } from '../repositories/interaction.repository';
import { UserInterestEntity } from '../entities/user-interest.entity';
import { UserInteractionEntity, InteractionType } from '../entities/user-interaction.entity';
import { RANKING_CONFIG } from '../config/ranking.config';

@Injectable()
export class InterestEngine {
  private readonly logger = new Logger(InterestEngine.name);

  constructor(private readonly interactionRepo: InteractionRepository) {}

  /**
   * Log telemetry action and dynamically recalculate category affinity score for user.
   */
  async recordInteraction(
    userId: string,
    postId: string,
    category: string,
    type: InteractionType,
    weightMultiplier = 1.0,
  ): Promise<void> {
    this.logger.log(`Recording interaction: user=${userId}, post=${postId}, type=${type}`);

    // 1. Determine interaction raw weight based on configuration
    let baseWeight = 0.2; // default for VIEW/Impressions
    if (type === InteractionType.LIKE) baseWeight = RANKING_CONFIG.engagementMultipliers.like;
    if (type === InteractionType.COMMENT) baseWeight = RANKING_CONFIG.engagementMultipliers.comment;
    if (type === InteractionType.SAVE) baseWeight = RANKING_CONFIG.engagementMultipliers.save;
    if (type === InteractionType.SHARE) baseWeight = RANKING_CONFIG.engagementMultipliers.share;

    const finalWeight = baseWeight * weightMultiplier;

    // 2. Save telemetric raw interaction
    const interaction = new UserInteractionEntity({
      id: randomUUID(),
      userId,
      postId,
      category,
      interactionType: type,
      weight: finalWeight,
    });
    await this.interactionRepo.saveInteraction(interaction);

    // 3. Update cumulative category interest profile
    let interest = await this.interactionRepo.findInterest(userId, category);
    if (!interest) {
      interest = new UserInterestEntity({
        id: randomUUID(),
        userId,
        category,
        score: finalWeight,
      });
    } else {
      interest.score += finalWeight;
    }

    await this.interactionRepo.saveInterest(interest);
    this.logger.log(`Updated interest vector: user=${userId}, category=${category}, newScore=${interest.score.toFixed(2)}`);
  }

  /**
   * Fetch category affinity map for a user (e.g. { 'story': 4.5, 'food': 1.2 })
   */
  async getUserInterestMap(userId: string): Promise<Record<string, number>> {
    const list = await this.interactionRepo.getInterests(userId);
    const map: Record<string, number> = {};
    for (const interest of list) {
      map[interest.category] = interest.score;
    }
    return map;
  }
}
