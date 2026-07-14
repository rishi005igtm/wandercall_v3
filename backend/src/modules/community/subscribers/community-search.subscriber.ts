import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  CommunityEventDispatcher,
  CommunityEvents,
} from '../events/community-event.dispatcher';

@Injectable()
export class CommunitySearchSubscriber implements OnModuleInit {
  private readonly logger = new Logger(CommunitySearchSubscriber.name);

  constructor(private readonly dispatcher: CommunityEventDispatcher) {}

  onModuleInit() {
    this.dispatcher.on(
      CommunityEvents.CREATED,
      async (payload: { communityId: string; ownerId: string }) => {},
    );

    this.dispatcher.on(
      CommunityEvents.UPDATED,
      async (payload: { communityId: string; updatedBy: string }) => {},
    );

    this.dispatcher.on(
      CommunityEvents.DELETED,
      async (payload: { communityId: string; deletedBy: string }) => {},
    );

    this.dispatcher.on(
      CommunityEvents.ROLE_CHANGED,
      async (payload: {
        communityId: string;
        userId: string;
        roleId: string;
      }) => {},
    );
  }
}
