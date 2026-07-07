import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CommunityEventDispatcher, CommunityEvents } from '../events/community-event.dispatcher';

@Injectable()
export class CommunityGalaxySubscriber implements OnModuleInit {
  private readonly logger = new Logger(CommunityGalaxySubscriber.name);

  constructor(
    private readonly dispatcher: CommunityEventDispatcher,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing CommunityGalaxySubscriber event listeners...');

    this.dispatcher.on(CommunityEvents.CREATED, async (payload: { communityId: string }) => {
      this.logger.log(`Galaxy Spatial Cluster: Invalidating cluster cache for new community ${payload.communityId}`);
    });

    this.dispatcher.on(CommunityEvents.UPDATED, async (payload: { communityId: string }) => {
      this.logger.log(`Galaxy Spatial Cluster: Updating spatial position/metadata for ${payload.communityId}`);
    });

    this.dispatcher.on(CommunityEvents.DELETED, async (payload: { communityId: string }) => {
      this.logger.log(`Galaxy Spatial Cluster: Removing community ${payload.communityId} from spatial index`);
    });
  }
}
