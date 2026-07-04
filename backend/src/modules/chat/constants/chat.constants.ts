/** Maximum characters in a single text message */
export const MAX_MESSAGE_LENGTH = 4000;

/** Maximum number of attachments per message */
export const MAX_ATTACHMENTS_PER_MESSAGE = 10;

/** Rate limiting: max messages per window */
export const RATE_LIMIT_MAX_MESSAGES = 20;
export const RATE_LIMIT_WINDOW_MS = 10_000; // 10 seconds

/** Cursor pagination default */
export const DEFAULT_MESSAGE_PAGE_SIZE = 30;
export const MAX_MESSAGE_PAGE_SIZE = 100;

/** TTL for presence data in Redis (seconds) */
export const PRESENCE_TTL_SECONDS = 60 * 60 * 24; // 24 hours for lastSeen

/** Typing indicator auto-clear timeout (ms) — server clears if client forgets to stop */
export const TYPING_AUTO_CLEAR_MS = 5000;

/** Socket namespace */
export const CHAT_NAMESPACE = '/chat';

/** Redis key prefixes */
export const REDIS_KEYS = {
  PRESENCE: (userId: string) => `presence:${userId}`,
  SOCKET_MAP: (userId: string) => `sockets:${userId}`,
  TYPING: (conversationId: string) => `typing:${conversationId}`,
  RATE_LIMIT: (userId: string) => `ratelimit:msg:${userId}`,
};

/** Socket event names — shared contract between client and server */
export const SOCKET_EVENTS = {
  // Client → Server
  SEND_MESSAGE: 'send-message',
  TYPING_START: 'typing-start',
  TYPING_STOP: 'typing-stop',
  MARK_DELIVERED: 'mark-delivered',
  MARK_READ: 'mark-read',
  OPEN_CONVERSATION: 'open-conversation',

  // Server → Client
  MESSAGE_NEW: 'message:new',
  MESSAGE_DELIVERED: 'message:delivered',
  MESSAGE_READ: 'message:read',
  MESSAGE_EDITED: 'message:edited',
  MESSAGE_DELETED: 'message:deleted',
  TYPING_START_BROADCAST: 'typing:start',
  TYPING_STOP_BROADCAST: 'typing:stop',
  PRESENCE_CHANGE: 'presence:change',
  CONVERSATION_UPDATED: 'conversation:updated',
  ERROR: 'chat:error',

  // Connection
  CONNECTED: 'chat:connected',
  AUTH_ERROR: 'chat:auth-error',
} as const;
