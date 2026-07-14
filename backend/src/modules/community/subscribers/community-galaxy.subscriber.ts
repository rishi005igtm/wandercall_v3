import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  CommunityEventDispatcher,
  CommunityEvents,
} from '../events/community-event.dispatcher';

@Injectable()
export class CommunityGalaxySubscriber implements OnModuleInit {
  private readonly logger = new Logger(CommunityGalaxySubscriber.name);

  constructor(private readonly dispatcher: CommunityEventDispatcher) {}

  onModuleInit() {
    this.dispatcher.on(
      CommunityEvents.CREATED,
      async (payload: { communityId: string }) => {},
    );

    this.dispatcher.on(
      CommunityEvents.UPDATED,
      async (payload: { communityId: string }) => {},
    );

    this.dispatcher.on(
      CommunityEvents.DELETED,
      async (payload: { communityId: string }) => {},
    );
  }
}
