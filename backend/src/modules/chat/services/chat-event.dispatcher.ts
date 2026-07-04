import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import { ChatEvent, IChatEventDispatcher } from '../interfaces/chat-event.interface';

/**
 * ChatEventDispatcher — In-process EventEmitter implementation.
 *
 * Design philosophy:
 * - Uses Node.js EventEmitter under the hood
 * - The IChatEventDispatcher interface is the only contract other services depend on
 * - To migrate to Redis Pub/Sub or Kafka, swap this class behind the same interface
 *   without touching ChatService, NotificationService, or any consumer
 *
 * Current subscribers are registered in chat.module.ts.
 * Future subscribers (NotificationService, AnalyticsService, SearchIndexer) just
 * call dispatcher.on('MESSAGE_CREATED', handler) from their own modules.
 */
@Injectable()
export class ChatEventDispatcher extends EventEmitter implements IChatEventDispatcher {
  private readonly logger = new Logger(ChatEventDispatcher.name);

  constructor() {
    super();
    // Prevent memory leak warning for high subscriber counts in large deployments
    this.setMaxListeners(50);
  }

  dispatch<T extends ChatEvent>(event: T): void {
    this.logger.debug(`Dispatching event: ${event.type}`);
    this.emit(event.type, event.payload);
    this.emit('*', event); // wildcard — useful for audit logging
  }

  /**
   * Subscribe to a specific event type.
   * Use this instead of .on() directly so the type system enforces event shape.
   */
  subscribe<T extends ChatEvent>(
    eventType: T['type'],
    handler: (payload: T['payload']) => void,
  ): void {
    this.on(eventType, handler);
    this.logger.debug(`Subscriber registered for ${eventType}`);
  }
}
