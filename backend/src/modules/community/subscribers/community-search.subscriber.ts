import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CommunityEventDispatcher, CommunityEvents } from '../events/community-event.dispatcher';

@Injectable()
export class CommunitySearchSubscriber implements OnModuleInit {
  private readonly logger = new Logger(CommunitySearchSubscriber.name);

  constructor(
    private readonly dispatcher: CommunityEventDispatcher,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing CommunitySearchSubscriber event listeners...');

    this.dispatcher.on(CommunityEvents.CREATED, async (payload: { communityId: string; ownerId: string }) => {
      this.logger.log(`Search Index: Syncing new community ${payload.communityId}`);
    });

    this.dispatcher.on(CommunityEvents.UPDATED, async (payload: { communityId: string; updatedBy: string }) => {
      this.logger.log(`Search Index: Updating community ${payload.communityId}`);
    });

    this.dispatcher.on(CommunityEvents.DELETED, async (payload: { communityId: string; deletedBy: string }) => {
      this.logger.log(`Search Index: Removing deleted community ${payload.communityId}`);
    });

    this.dispatcher.on(CommunityEvents.ROLE_CHANGED, async (payload: { communityId: string; userId: string; roleId: string }) => {
      this.logger.log(`Search Index: Updating member role index for user ${payload.userId} in ${payload.communityId}`);
    });
  }
}
