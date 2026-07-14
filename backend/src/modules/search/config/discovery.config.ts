export const DISCOVERY_CONFIG = {
  weights: {
    mutualFriends: 35, // High indicator of real-world social connection
    sharedInterests: 25, // Category overlap from UserInterestEntity
    locationSimilarity: 20, // Proximity (same city or Haversine distance)
    explorerLevel: 10, // Account activity, level, and reputation
    interactionHistory: 10, // Past affinity or post engagement
  },
  thresholds: {
    minCompatibilityScore: 30, // Minimum percentage to recommend
    maxRecommendations: 50, // Maximum candidate pool size
    circleNodesCount: 15, // Number of nodes in Explorer Circles graph
    cacheTtlMinutes: 15, // Redis and DB cache TTL
    diversityMaxSameCategory: 3, // Max consecutive explorers from same primary category
  },
  defaultReasons: [
    'Fellow Explorer in the Wandercall community',
    'Shared passion for adventure and discovery',
    'Active member in similar adventure circles',
  ],
};
