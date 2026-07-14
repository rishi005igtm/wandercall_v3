import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CommunityEventDispatcher,
  CommunityEvents,
} from '../events/community-event.dispatcher';
import { CommunityStatisticsEntity } from '../entities/community-statistics.entity';
import { CommunityEntity } from '../entities/community.entity';

@Injectable()
export class CommunityStatisticsSubscriber implements OnModuleInit {
  private readonly logger = new Logger(CommunityStatisticsSubscriber.name);

  constructor(
    private readonly dispatcher: CommunityEventDispatcher,
    @InjectRepository(CommunityStatisticsEntity)
    private readonly statsRepo: Repository<CommunityStatisticsEntity>,
    @InjectRepository(CommunityEntity)
    private readonly communityRepo: Repository<CommunityEntity>,
  ) {}

  onModuleInit() {
    this.dispatcher.on(
      CommunityEvents.JOINED,
      async (payload: { communityId: string; userId: string }) => {
        try {
          await this.handleMemberJoined(payload.communityId);
        } catch (err: any) {
          this.logger.error(
            `Error handling JOINED event for stats: ${err.message}`,
            err.stack,
          );
        }
      },
    );

    this.dispatcher.on(
      CommunityEvents.LEFT,
      async (payload: { communityId: string; userId: string }) => {
        try {
          await this.handleMemberLeft(payload.communityId);
        } catch (err: any) {
          this.logger.error(
            `Error handling LEFT event for stats: ${err.message}`,
            err.stack,
          );
        }
      },
    );

    this.dispatcher.on(
      CommunityEvents.MEMBER_KICKED,
      async (payload: { communityId: string; userId: string }) => {
        try {
          await this.handleMemberLeft(payload.communityId);
        } catch (err: any) {
          this.logger.error(
            `Error handling MEMBER_KICKED event for stats: ${err.message}`,
            err.stack,
          );
        }
      },
    );

    this.dispatcher.on(
      CommunityEvents.MEMBER_BANNED,
      async (payload: { communityId: string; userId: string }) => {
        try {
          await this.handleMemberLeft(payload.communityId);
        } catch (err: any) {
          this.logger.error(
            `Error handling MEMBER_BANNED event for stats: ${err.message}`,
            err.stack,
          );
        }
      },
    );
  }

  private async handleMemberJoined(communityId: string): Promise<void> {
    await this.statsRepo
      .createQueryBuilder()
      .update(CommunityStatisticsEntity)
      .set({
        activeMembers: () => '"activeMembers" + 1',
      })
      .where('communityId = :communityId', { communityId })
      .execute();
  }

  private async handleMemberLeft(communityId: string): Promise<void> {
    await this.statsRepo
      .createQueryBuilder()
      .update(CommunityStatisticsEntity)
      .set({
        activeMembers: () => 'GREATEST("activeMembers" - 1, 0)',
      })
      .where('communityId = :communityId', { communityId })
      .execute();
  }
}
