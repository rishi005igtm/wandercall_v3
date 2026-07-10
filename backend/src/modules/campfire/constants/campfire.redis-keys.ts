export const CampfireRedisKeys = {
  // Base key
  base: (id: string) => `campfire:${id}`,

  // Live presence mapping (Redis Set of active participants)
  presence: (id: string) => `campfire:${id}:presence`,

  // Roles inside the campfire
  listeners: (id: string) => `campfire:${id}:listeners`,
  speakers: (id: string) => `campfire:${id}:speakers`,
  
  // Pending queue for speaker requests
  queue: (id: string) => `campfire:${id}:queue`,

  // Future features
  chat: (id: string) => `campfire:${id}:chat`,
  events: (id: string) => `campfire:${id}:events`,
};
