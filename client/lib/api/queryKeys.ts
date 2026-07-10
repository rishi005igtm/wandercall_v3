export const QUERY_KEYS = {
  AUTH: {
    SESSION: ['auth', 'session'] as const,
  },
  USER: {
    CURRENT: ['user', 'current'] as const,
    PROFILE: (userId: string) => ['user', 'profile', userId] as const,
    SETTINGS: (userId: string) => ['user', 'settings', userId] as const,
    PLAN: (userId: string) => ['user', 'plan', userId] as const,
    USERNAME_CHECK: (username: string) => ['user', 'username', 'check', username] as const,
    USERNAME_SUGGESTIONS: (name: string) => ['user', 'username', 'suggestions', name] as const,
    PUBLIC_PROFILE: (username: string) => ['user', 'public_profile', username] as const,
    RELATIONSHIP: (username: string) => ['user', 'relationship', username] as const,
    FOLLOWERS: (username: string, search?: string) => ['user', 'followers', username, { search }] as const,
    FOLLOWING: (username: string, search?: string) => ['user', 'following', username, { search }] as const,
  },
  EXPERIENCES: {
    ALL: ['experiences'] as const,
    DETAIL: (id: string) => ['experiences', id] as const,
  },
  COMMUNITIES: {
    ALL: ['communities'] as const,
    DETAIL: (slug: string) => ['communities', 'detail', slug] as const,
    SETTINGS: (id: string) => ['communities', 'settings', id] as const,
    SEARCH: (query: string) => ['communities', 'search', query] as const,
    GALAXY: (categoryId?: string) => ['communities', 'galaxy', { categoryId }] as const,
    CATEGORIES: ['communities', 'categories'] as const,
    COORDINATES: (categoryId?: string) => ['communities', 'coordinates', { categoryId }] as const,
    MEMBERS: (communityId: string, query?: string) => ['communities', 'members', communityId, { query }] as const,
  },
  BOOKINGS: {
    USER: ['bookings', 'user'] as const,
  },
  WISHLIST: {
    USER: ['wishlist', 'user'] as const,
  },
  NOTIFICATIONS: {
    USER: ['notifications', 'user'] as const,
  },
  FEED: {
    LIST: (filters: any) => ['feed', 'list', filters] as const,
    INFINITE: (filters: any) => ['feed', 'infinite', filters] as const,
    USER_FEED: (username: string, category?: string) => ['feed', 'user', username, { category }] as const,
    COMMENTS: (postId: string) => ['feed', 'comments', postId] as const,
  },
  CHAT: {
    CONVERSATIONS: ['chat', 'conversations'] as const,
    MESSAGES: (conversationId: string) => ['chat', 'messages', conversationId] as const,
    PRESENCE: (userId: string) => ['chat', 'presence', userId] as const,
  },
  CAMPFIRES: {
    ALL: ['campfires'] as const,
    DETAIL: (id: string) => ['campfires', 'detail', id] as const,
    SEARCH: (params: any) => ['campfires', 'search', params] as const,
    TRENDING: (params: any) => ['campfires', 'trending', params] as const,
    LIVE: (params: any) => ['campfires', 'live', params] as const,
    RECOMMENDED: (params: any) => ['campfires', 'recommended', params] as const,
    CATEGORY: (category: string) => ['campfires', 'category', category] as const,
    USER: (userId: string) => ['campfires', 'user', userId] as const,
    HOST: (hostId: string) => ['campfires', 'host', hostId] as const,
    WORKSPACE: (tab: string) => ['campfires', 'workspace', tab] as const,
  },
} as const;

