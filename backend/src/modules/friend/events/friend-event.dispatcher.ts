import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface FriendRequestEvent {
  followerId: string;
  followingId: string;
}

export type FriendEvents =
  | 'FRIEND_REQUEST_NEW'
  | 'FRIEND_REQUEST_ACCEPTED'
  | 'FRIEND_REQUEST_REMOVED';

@Injectable()
export class FriendEventDispatcher {
  private readonly logger = new Logger(FriendEventDispatcher.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  dispatch<T = any>(event: FriendEvents, payload: T): void {
    this.logger.debug(`Dispatching event: ${event}`);
    this.eventEmitter.emit(event, payload);
  }

  subscribe<T = any>(event: FriendEvents, listener: (payload: T) => void): void {
    this.eventEmitter.on(event, listener);
  }
}
