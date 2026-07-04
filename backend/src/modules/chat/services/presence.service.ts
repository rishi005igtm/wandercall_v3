import { Injectable, Logger } from '@nestjs/common';
import {
  IPresenceService,
  PresenceStatus,
  UserPresence,
} from '../interfaces/presence.interface';
import { TYPING_AUTO_CLEAR_MS } from '../constants/chat.constants';

/**
 * PresenceService — In-memory implementation.
 *
 * Tracks:
 * - Which users are online (userId → Set<socketId>)
 * - What status each user has (online, typing, recording, etc.)
 * - Which conversations a user is currently typing in
 *
 * Design philosophy:
 * - NEVER writes typing state to the database
 * - Typing indicators use in-memory maps with auto-clear timers
 * - The interface is designed so this can be replaced with a Redis adapter
 *   (e.g. ioredis with hset/expire) without changing any consuming code
 *
 * Multi-device support:
 * - One user can have multiple socket IDs (multiple tabs/devices)
 * - User is considered online if ANY socket exists in their set
 * - All sockets for a user receive broadcasts when targeting that user
 */
@Injectable()
export class PresenceService implements IPresenceService {
  private readonly logger = new Logger(PresenceService.name);

  /** Map<userId, Set<socketId>> — multi-device socket tracking */
  private readonly socketMap = new Map<string, Set<string>>();

  /** Map<userId, UserPresence> — current status per user */
  private readonly presenceMap = new Map<string, UserPresence>();

  /** Map<`${userId}:${conversationId}`, NodeJS.Timeout> — auto-clear timers for typing */
  private readonly typingTimers = new Map<string, NodeJS.Timeout>();

  connect(userId: string, socketId: string): void {
    if (!this.socketMap.has(userId)) {
      this.socketMap.set(userId, new Set());
    }
    this.socketMap.get(userId)!.add(socketId);

    const existing = this.presenceMap.get(userId);
    this.presenceMap.set(userId, {
      userId,
      status: PresenceStatus.ONLINE,
      lastSeen: undefined,
      typingIn: existing?.typingIn ?? [],
      socketIds: this.socketMap.get(userId)!,
    });

    this.logger.debug(`User ${userId} connected via socket ${socketId}. Total sockets: ${this.socketMap.get(userId)!.size}`);
  }

  disconnect(userId: string, socketId: string): void {
    const sockets = this.socketMap.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.socketMap.delete(userId);
        this.presenceMap.set(userId, {
          userId,
          status: PresenceStatus.OFFLINE,
          lastSeen: new Date(),
          typingIn: [],
          socketIds: new Set(),
        });
        this.logger.debug(`User ${userId} went offline (last socket disconnected)`);
      } else {
        this.logger.debug(`User ${userId} disconnected socket ${socketId}. Remaining: ${sockets.size}`);
      }
    }
  }

  getSocketIds(userId: string): Set<string> {
    return this.socketMap.get(userId) ?? new Set();
  }

  isOnline(userId: string): boolean {
    const sockets = this.socketMap.get(userId);
    return !!sockets && sockets.size > 0;
  }

  setStatus(userId: string, status: PresenceStatus): void {
    const existing = this.presenceMap.get(userId);
    if (existing) {
      existing.status = status;
    }
  }

  getPresence(userId: string): UserPresence | null {
    return this.presenceMap.get(userId) ?? null;
  }

  startTyping(userId: string, conversationId: string): void {
    const presence = this.presenceMap.get(userId);
    if (presence && !presence.typingIn?.includes(conversationId)) {
      presence.typingIn = [...(presence.typingIn ?? []), conversationId];
    }

    // Auto-clear typing after timeout in case client forgets to send typing-stop
    const key = `${userId}:${conversationId}`;
    const existing = this.typingTimers.get(key);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.stopTyping(userId, conversationId);
      this.typingTimers.delete(key);
    }, TYPING_AUTO_CLEAR_MS);

    this.typingTimers.set(key, timer);
  }

  stopTyping(userId: string, conversationId: string): void {
    const presence = this.presenceMap.get(userId);
    if (presence) {
      presence.typingIn = (presence.typingIn ?? []).filter((id) => id !== conversationId);
    }

    const key = `${userId}:${conversationId}`;
    const timer = this.typingTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.typingTimers.delete(key);
    }
  }

  getTypingUsers(conversationId: string): string[] {
    const typing: string[] = [];
    for (const [userId, presence] of this.presenceMap.entries()) {
      if (presence.typingIn?.includes(conversationId)) {
        typing.push(userId);
      }
    }
    return typing;
  }

  /** Get a summary of all online users (for debugging/admin) */
  getOnlineCount(): number {
    return this.socketMap.size;
  }
}
