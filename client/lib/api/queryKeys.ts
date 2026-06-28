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
  },
  EXPERIENCES: {
    ALL: ['experiences'] as const,
    DETAIL: (id: string) => ['experiences', id] as const,
  },
  COMMUNITIES: {
    ALL: ['communities'] as const,
    DETAIL: (id: string) => ['communities', id] as const,
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
} as const;
