import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import { RedisService } from '../../redis/redis-core.service';
import { CampfireRedisKeys } from '../constants/campfire.redis-keys';

export const CampfireEvents = {
  CREATED: 'CAMPFIRE_CREATED',
  UPDATED: 'CAMPFIRE_UPDATED',
  DELETED: 'CAMPFIRE_DELETED',
  STARTED: 'CAMPFIRE_STARTED',
  CLOSED: 'CAMPFIRE_CLOSED',
};

@Injectable()
export class CampfireEventDispatcher extends EventEmitter {
  private readonly logger = new Logger(CampfireEventDispatcher.name);

  constructor(private readonly redisService: RedisService) {
    super();
    this.setMaxListeners(50);
  }

  emit(eventName: string | symbol, ...args: any[]): boolean {
    const result = super.emit(eventName, ...args);
    const payload = args[0];
    
    if (payload && payload.id) {
      const channel = CampfireRedisKeys.events(payload.id);
      this.redisService.client.publish(channel, JSON.stringify({ event: eventName, payload }))
        .catch(err => this.logger.error(`Redis publish failed for ${String(eventName)}`, err));
    } else if (payload && payload.campfireId) {
      const channel = CampfireRedisKeys.events(payload.campfireId);
      this.redisService.client.publish(channel, JSON.stringify({ event: eventName, payload }))
        .catch(err => this.logger.error(`Redis publish failed for ${String(eventName)}`, err));
    }

    return result;
  }

  dispatchCreated(campfire: any) {
    this.logger.debug(`Dispatching event: ${CampfireEvents.CREATED}`);
    this.emit(CampfireEvents.CREATED, campfire);
  }

  dispatchUpdated(campfire: any) {
    this.logger.debug(`Dispatching event: ${CampfireEvents.UPDATED}`);
    this.emit(CampfireEvents.UPDATED, campfire);
  }

  dispatchDeleted(campfireId: string, communityId: string) {
    this.logger.debug(`Dispatching event: ${CampfireEvents.DELETED}`);
    this.emit(CampfireEvents.DELETED, { campfireId, communityId });
  }

  dispatchStarted(campfire: any) {
    this.logger.debug(`Dispatching event: ${CampfireEvents.STARTED}`);
    this.emit(CampfireEvents.STARTED, campfire);
  }

  dispatchClosed(campfire: any) {
    this.logger.debug(`Dispatching event: ${CampfireEvents.CLOSED}`);
    this.emit(CampfireEvents.CLOSED, campfire);
  }
}
