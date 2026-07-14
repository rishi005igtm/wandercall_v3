export const RANKING_CONFIG = {
  weights: {
    interest: 0.3,
    following: 0.2,
    freshness: 0.15,
    popularity: 0.15,
    authorAffinity: 0.1,
    aiQuality: 0.05,
    diversityBoost: 0.05,
  },
  engagementMultipliers: {
    view: 0.1,
    longView: 0.2,
    like: 1.0,
    save: 2.0,
    comment: 3.0,
    share: 4.0,
    follow: 5.0,
  },
  freshness: {
    decayRate: 0.15, // Daily exponential decay factor for post score
    newPostBoost: 1.5, // Temporary multiplier for very new posts
    newPostWindowHours: 24, // Window where new post boost applies
  },
  penalties: {
    seen1x: 1.0, // No penalty for first view
    seen2x: 0.8, // Slight penalty
    seen3x: 0.4, // Larger penalty
    seen4xPlus: 0.1, // Significant penalty
    authorFatigue: 0.7, // Penalty if showing same author repeatedly
  },
  diversity: {
    maxConsecutiveAuthor: 2,
    maxConsecutiveCategory: 3,
  },
  feedComposition: {
    interest: 0.65, // 65% user interest content
    explore: 0.25, // 25% exploratory content
    trending: 0.1, // 10% trending content
  },
  interestLearning: {
    timeDecayFactor: 0.95, // Decay factor per week for old interests
  },
};
