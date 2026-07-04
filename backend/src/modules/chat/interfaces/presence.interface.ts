export enum PresenceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  IDLE = 'IDLE',
  TYPING = 'TYPING',
  RECORDING_AUDIO = 'RECORDING_AUDIO',
  UPLOADING = 'UPLOADING',
  DO_NOT_DISTURB = 'DO_NOT_DISTURB',
}

export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeen?: Date;
  /** Map of conversationId → true for users currently typing in that conversation */
  typingIn?: string[];
  /** Set of socket IDs for this user (multi-device support) */
  socketIds: Set<string>;
}

export interface IPresenceService {
  /** Register a socket connection for a user */
  connect(userId: string, socketId: string): void;

  /** Remove a socket connection; update lastSeen if no sockets remain */
  disconnect(userId: string, socketId: string): void;

  /** Get all socket IDs for a user across devices */
  getSocketIds(userId: string): Set<string>;

  /** Whether the user has at least one active socket */
  isOnline(userId: string): boolean;

  /** Set the user's presence status */
  setStatus(userId: string, status: PresenceStatus): void;

  /** Get the user's current presence */
  getPresence(userId: string): UserPresence | null;

  /** Mark user as typing in a conversation */
  startTyping(userId: string, conversationId: string): void;

  /** Remove typing indicator */
  stopTyping(userId: string, conversationId: string): void;

  /** Get all users currently typing in a conversation */
  getTypingUsers(conversationId: string): string[];
}
