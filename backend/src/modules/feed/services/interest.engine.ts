import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InteractionRepository } from '../repositories/interaction.repository';
import { UserInterestEntity } from '../entities/user-interest.entity';
import { UserAuthorAffinityEntity } from '../entities/user-author-affinity.entity';
import { InteractionType } from '../enums/interaction-type.enum';
import { RANKING_CONFIG } from '../config/ranking.config';

@Injectable()
export class InterestEngine {
  private readonly logger = new Logger(InterestEngine.name);

  constructor(private readonly interactionRepo: InteractionRepository) {}

  /**
   * Log telemetry action and dynamically recalculate category and author affinity.
   */
  async recordInteraction(
    userId: string,
    postId: string,
    authorId: string,
    categoryRaw: string,
    type: InteractionType,
    weightMultiplier = 1.0,
  ): Promise<void> {
    const categoryMap: Record<string, string> = {
      story: 'Adventure Story',
      memory: 'Travel Memory',
      itinerary: 'Route & Itinerary',
      tips: 'Tips & Hacks',
      food: 'Food Guide',
      stay: 'Stay Review',
    };

    const category = categoryMap[categoryRaw.toLowerCase()] || categoryRaw;

    // 1. Determine interaction raw weight based on configuration
    let baseWeight = RANKING_CONFIG.engagementMultipliers.view;
    if (type === InteractionType.LIKE)
      baseWeight = RANKING_CONFIG.engagementMultipliers.like;
    if (type === InteractionType.COMMENT)
      baseWeight = RANKING_CONFIG.engagementMultipliers.comment;
    if (type === InteractionType.SAVE)
      baseWeight = RANKING_CONFIG.engagementMultipliers.save;
    if (type === InteractionType.SHARE)
      baseWeight = RANKING_CONFIG.engagementMultipliers.share;
    // Follow action could be handled separately, but included for completion

    const finalWeight = baseWeight * weightMultiplier;

    // 2. Update cumulative category interest profile with Time Decay
    let interest = await this.interactionRepo.findInterest(userId, category);
    const now = new Date();

    if (!interest) {
      interest = new UserInterestEntity({
        id: randomUUID(),
        userId,
        category,
        rawScore: finalWeight,
        normalizedScore: finalWeight * 0.1,
        interactionCount: 1,
        lastInteractionAt: now,
        lastDecay: now,
        decayFactor: RANKING_CONFIG.interestLearning.timeDecayFactor,
        confidenceScore: 0.1,
      });
    } else {
      // Apply time decay: (days since last decay / 7) * decayFactor
      if (interest.lastDecay) {
        const diffMs = Math.max(
          0,
          now.getTime() - interest.lastDecay.getTime(),
        );
        const weeksElapsed = diffMs / (1000 * 60 * 60 * 24 * 7);
        const decayMultiplier = Math.pow(interest.decayFactor, weeksElapsed);
        interest.rawScore *= decayMultiplier;
      } else if (interest.lastInteractionAt) {
        // Fallback for migrated data
        const diffMs = Math.max(
          0,
          now.getTime() - interest.lastInteractionAt.getTime(),
        );
        const weeksElapsed = diffMs / (1000 * 60 * 60 * 24 * 7);
        const decayMultiplier = Math.pow(interest.decayFactor, weeksElapsed);
        interest.rawScore *= decayMultiplier;
      }

      interest.rawScore += finalWeight;
      interest.interactionCount += 1;
      interest.lastInteractionAt = now;
      interest.lastDecay = now;
      // Confidence approaches 1.0 asymptotically based on interaction count
      interest.confidenceScore = Math.min(
        1.0,
        interest.interactionCount / 50.0,
      );

      interest.normalizedScore = interest.rawScore * interest.confidenceScore;
    }

    await this.interactionRepo.saveInterest(interest);

    // 3. Update Author Affinity profile
    if (authorId && authorId !== userId) {
      let affinity = await this.interactionRepo.findAuthorAffinity(
        userId,
        authorId,
      );
      if (!affinity) {
        affinity = new UserAuthorAffinityEntity({
          id: randomUUID(),
          userId,
          authorId,
          affinityScore: finalWeight,
          interactionCount: 1,
          lastInteractionAt: now,
        });
      } else {
        if (affinity.lastInteractionAt) {
          const diffMs = Math.max(
            0,
            now.getTime() - affinity.lastInteractionAt.getTime(),
          );
          const weeksElapsed = diffMs / (1000 * 60 * 60 * 24 * 7);
          const decayMultiplier = Math.pow(0.9, weeksElapsed); // Fixed decay for authors
          affinity.affinityScore *= decayMultiplier;
        }
        affinity.affinityScore += finalWeight;
        affinity.interactionCount += 1;
        affinity.lastInteractionAt = now;
      }
      await this.interactionRepo.saveAuthorAffinity(affinity);
    }
  }

  async getUserInterestMap(userId: string): Promise<Record<string, number>> {
    const list = await this.interactionRepo.getInterests(userId);
    const map: Record<string, number> = {};
    for (const interest of list) {
      map[interest.category] = interest.normalizedScore;
    }
    return map;
  }

  async getUserAuthorAffinityMap(
    userId: string,
  ): Promise<Record<string, number>> {
    const list = await this.interactionRepo.getAuthorAffinities(userId);
    const map: Record<string, number> = {};
    for (const affinity of list) {
      map[affinity.authorId] = affinity.affinityScore;
    }
    return map;
  }
}
