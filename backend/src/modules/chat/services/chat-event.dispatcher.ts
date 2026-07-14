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
    // Subscribe to all community events using pattern
    subscriber.psubscribe('community:*:events', (err, count) => {
      if (err) {
        this.logger.error(
          'Failed to subscribe to Redis community events pattern',
          err,
        );
      } else {
      }
    });

    subscriber.on('pmessage', (pattern, channel, message) => {
      try {
        const payload = JSON.parse(message);
        // Forward the Redis event to our local in-process EventEmitter
        // so that the local Gateway can emit it to connected sockets on THIS node.
        if (payload.type === 'COMMUNITY_MESSAGE_CREATED') {
          this.emit('COMMUNITY_MESSAGE_CREATED', payload.data);
        }
      } catch (err) {
        this.logger.error('Failed to parse Redis pub/sub message', err);
      }
    });
  }

  dispatch<T extends ChatEvent>(event: T): void {
    this.emit(event.type, event.payload);
    this.emit('*', event);
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

  /**
   * Dispatches a community message.
   * Instead of just emitting locally, this publishes to Redis so ALL gateway nodes receive it.
   */
  dispatchCommunityMessage(communityId: string, message: MessageEntity) {
    const payload = {
      type: 'COMMUNITY_MESSAGE_CREATED',
      data: { communityId, message },
    };

    // Publish to Redis
    this.redisService.client
      .publish(`community:${communityId}:events`, JSON.stringify(payload))
      .catch((err) => {
        this.logger.error(
          `Failed to publish community message to Redis: ${err.message}`,
        );
      });
  }
}
