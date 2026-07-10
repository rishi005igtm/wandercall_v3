import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { CampfireEventDispatcher, CampfireEvents } from './campfire-event.dispatcher';
import { CampfireDiscoveryCacheService } from '../services/campfire-discovery-cache.service';

@Injectable()
export class CampfireDiscoverySubscriber implements OnModuleInit {
  private readonly logger = new Logger(CampfireDiscoverySubscriber.name);

  constructor(
    private readonly dispatcher: CampfireEventDispatcher,
    private readonly discoveryCacheService: CampfireDiscoveryCacheService,
  ) {}

  onModuleInit() {
    this.dispatcher.on(CampfireEvents.CREATED, async (campfire) => {
      this.logger.debug(`Invalidating discovery cache for CampfireCreated: ${campfire.id}`);
      await this.discoveryCacheService.invalidateAllDiscovery();
    });

    this.dispatcher.on(CampfireEvents.UPDATED, async (campfire) => {
      this.logger.debug(`Invalidating discovery cache for CampfireUpdated: ${campfire.id}`);
      await this.discoveryCacheService.invalidateAllDiscovery();
    });

    this.dispatcher.on(CampfireEvents.DELETED, async (payload) => {
      this.logger.debug(`Invalidating discovery cache for CampfireDeleted: ${payload.campfireId}`);
      await this.discoveryCacheService.invalidateAllDiscovery();
    });

    this.dispatcher.on(CampfireEvents.STARTED, async (campfire) => {
      this.logger.debug(`Invalidating discovery cache for CampfireStarted: ${campfire.id}`);
      await this.discoveryCacheService.invalidateAllDiscovery();
    });

    this.dispatcher.on(CampfireEvents.CLOSED, async (campfire) => {
      this.logger.debug(`Invalidating discovery cache for CampfireClosed: ${campfire.id}`);
      await this.discoveryCacheService.invalidateAllDiscovery();
    });
  }
}
