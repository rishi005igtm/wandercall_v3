import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  IPresenceService,
  PresenceStatus,
  UserPresence,
} from '../interfaces/presence.interface';
import { RedisService } from '../../redis/redis-core.service';
import { TYPING_AUTO_CLEAR_MS } from '../constants/chat.constants';

@Injectable()
export class PresenceService implements IPresenceService, OnModuleInit {
  private readonly logger = new Logger(PresenceService.name);

  // Typing indicators are ephemeral and handled primarily via pub/sub events.
  // We keep them in memory for local node fallback if needed.
  private readonly typingTimers = new Map<string, NodeJS.Timeout>();
  private readonly localTypingMap = new Map<string, string[]>();

  constructor(private readonly redisService: RedisService) {}

  async onModuleInit() {
    try {
      // Clear all stale presence data on server startup to prevent ghost online users
      const keys = await this.redisService.client.keys('presence:sockets:*');
      if (keys.length > 0) {
        await this.redisService.client.del(...keys);
      }
      await this.redisService.client.del('presence:status');
      this.logger.log('Cleared stale presence data from Redis on startup');
    } catch (e) {
      this.logger.error('Failed to clear presence data on startup', e);
    }
  }

  async connect(userId: string, socketId: string): Promise<void> {
    const socketsKey = `presence:sockets:${userId}`;
    
    // Add socket to the user's active sockets set
    const added = await this.redisService.client.sadd(socketsKey, socketId);
    
    if (added > 0) {
      const count = await this.redisService.client.scard(socketsKey);
      
      const presence: UserPresence = {
        userId,
        status: PresenceStatus.ONLINE,
        socketIds: new Set(),
      };
      
      await this.redisService.client.hset(
        'presence:status',
        userId,
        JSON.stringify({ ...presence, socketIds: [] })
      );
      
      if (count === 1) {
        this.logger.debug(`User ${userId} came ONLINE`);
      }
    }
  }

  async disconnect(userId: string, socketId: string): Promise<void> {
    const socketsKey = `presence:sockets:${userId}`;
    const removed = await this.redisService.client.srem(socketsKey, socketId);
    
    if (removed > 0) {
      const count = await this.redisService.client.scard(socketsKey);
      
      if (count === 0) {
        const presence: UserPresence = {
          userId,
          status: PresenceStatus.OFFLINE,
          lastSeen: new Date(),
          socketIds: new Set(),
        };
        
        await this.redisService.client.hset(
          'presence:status',
          userId,
          JSON.stringify({ ...presence, socketIds: [] })
        );
        this.logger.debug(`User ${userId} went OFFLINE`);
      }
    }
  }

  async getSocketIds(userId: string): Promise<Set<string>> {
    const socketsKey = `presence:sockets:${userId}`;
    const members = await this.redisService.client.smembers(socketsKey);
    return new Set(members);
  }

  async isOnline(userId: string): Promise<boolean> {
    const count = await this.redisService.client.scard(`presence:sockets:${userId}`);
    return count > 0;
  }

  async setStatus(userId: string, status: PresenceStatus): Promise<void> {
    const raw = await this.redisService.client.hget('presence:status', userId);
    if (raw) {
      try {
        const presence = JSON.parse(raw);
        presence.status = status;
        await this.redisService.client.hset('presence:status', userId, JSON.stringify(presence));
      } catch (e) {
        this.logger.error('Failed to parse presence from Redis', e);
      }
    }
  }

  async getPresence(userId: string): Promise<UserPresence | null> {
    const raw = await this.redisService.client.hget('presence:status', userId);
    if (raw) {
      try {
        const p = JSON.parse(raw);
        return {
          ...p,
          socketIds: new Set(),
        } as UserPresence;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  async startTyping(userId: string, conversationId: string): Promise<void> {
    if (!this.localTypingMap.has(conversationId)) {
      this.localTypingMap.set(conversationId, []);
    }
    const typingInConv = this.localTypingMap.get(conversationId)!;
    if (!typingInConv.includes(userId)) {
      typingInConv.push(userId);
    }

    const key = `${userId}:${conversationId}`;
    const existing = this.typingTimers.get(key);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.stopTyping(userId, conversationId);
      this.typingTimers.delete(key);
    }, TYPING_AUTO_CLEAR_MS);

    this.typingTimers.set(key, timer);
  }

  async stopTyping(userId: string, conversationId: string): Promise<void> {
    const typingInConv = this.localTypingMap.get(conversationId);
    if (typingInConv) {
      this.localTypingMap.set(
        conversationId,
        typingInConv.filter((id) => id !== userId),
      );
    }

    const key = `${userId}:${conversationId}`;
    const timer = this.typingTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.typingTimers.delete(key);
    }
  }

  async getTypingUsers(conversationId: string): Promise<string[]> {
    return this.localTypingMap.get(conversationId) ?? [];
  }
}
