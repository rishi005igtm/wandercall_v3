import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter } from 'events';
import {
  ChatEvent,
  IChatEventDispatcher,
} from '../interfaces/chat-event.interface';
import { RedisService } from '../../redis/redis-core.service';
import { MessageEntity } from '../entities/message.entity';

@Injectable()
export class ChatEventDispatcher
  extends EventEmitter
  implements IChatEventDispatcher, OnModuleInit
{
  private readonly logger = new Logger(ChatEventDispatcher.name);

  constructor(private readonly redisService: RedisService) {
    super();
    this.setMaxListeners(50);
  }

  onModuleInit() {
    this.initializeRedisSubscriber();
  }

  private initializeRedisSubscriber() {
    const subscriber = this.redisService.subscriber;
    
    subscriber.subscribe('chat:events', (err) => {
      if (err) this.logger.error('Failed to subscribe to chat events', err);
    });
    
    subscriber.on('message', (channel, message) => {
      if (channel === 'chat:events') {
        try {
          const payload = JSON.parse(message);
          // Emit locally so this node's gateway handles it
          this.emit(payload.type, payload.payload);
          this.emit('*', payload);
        } catch (err) {
          this.logger.error('Failed to parse Redis pub/sub message', err);
        }
      }
    });
  }

  dispatch<T extends ChatEvent>(event: T): void {
    // We publish everything to Redis instead of emitting locally immediately.
    // The Redis subscriber will pick it up and emit locally on all nodes.
    this.redisService.client
      .publish('chat:events', JSON.stringify(event))
      .catch((err) => {
        this.logger.error(`Failed to publish chat event to Redis: ${err.message}`);
      });
  }

  subscribe<T extends ChatEvent>(
    eventType: T['type'],
    handler: (payload: T['payload']) => void,
  ): void {
    this.on(eventType, handler);
  }

  dispatchUserConnected(userId: string, socketId: string) {
    this.dispatch({
      type: 'USER_CONNECTED',
      payload: { userId, socketId },
    });
  }

  dispatchUserDisconnected(
    userId: string,
    socketId: string,
    isStillOnline: boolean,
  ) {
    this.dispatch({
      type: 'USER_DISCONNECTED',
      payload: { userId, socketId, isStillOnline },
    });
  }
}
