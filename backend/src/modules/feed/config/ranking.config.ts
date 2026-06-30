export const RANKING_CONFIG = {
  weights: {
    interest: 0.35,      // Influence of user category affinity
    relationship: 0.25,  // Boost if creator is followed by user
    freshness: 0.20,     // Weight of post publication date
    engagement: 0.20,    // Weight of total engagement score
  },
  engagementMultipliers: {
    like: 1.0,
    comment: 2.0,
    save: 3.0,
    share: 4.0,
  },
  freshness: {
    decayRate: 0.15,     // Daily exponential decay factor (e.g., e^(-0.15 * days))
  },
  penalties: {
    seen: 0.20,          // Penalty multiplier (demotes posts the user has already viewed to 20% score)
    consecutiveCreator: 0.50, // Multiplier for repeated consecutive creator posts in the list
    consecutiveCategory: 0.65, // Multiplier for repeated consecutive categories in the list
  },
  diversity: {
    maxConsecutiveCreator: 1,
    maxConsecutiveCategory: 2,
  },
};
