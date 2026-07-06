import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChatEventDispatcher } from '../../chat/services/chat-event.dispatcher';
import { ChatGateway } from '../../chat/chat.gateway';
import { CommunityMemberRepository } from '../repositories/community-member.repository';
import { CommunityMemberStatus } from '../entities/community-member.entity';

@Injectable()
export class CommunityPresenceTracker implements OnModuleInit {
  private readonly logger = new Logger(CommunityPresenceTracker.name);

  // communityId -> Set of online user IDs
  private readonly communityOnlineMap = new Map<string, Set<string>>();

  // communityId -> boolean (isLive)
  private readonly communityLiveState = new Map<string, boolean>();

  constructor(
    private readonly chatDispatcher: ChatEventDispatcher,
    private readonly chatGateway: ChatGateway,
    private readonly memberRepo: CommunityMemberRepository,
  ) {}

  onModuleInit() {
    this.chatDispatcher.subscribe('USER_CONNECTED', this.handleUserConnected.bind(this));
    this.chatDispatcher.subscribe('USER_DISCONNECTED', this.handleUserDisconnected.bind(this));
    this.logger.log('Initialized and subscribed to Chat events');
  }

  private async handleUserConnected(payload: { userId: string; socketId: string }) {
    try {
      const allMembers = await this.memberRepo.findByUser(payload.userId);
      const members = allMembers.filter(m => m.status === CommunityMemberStatus.ACTIVE);

      for (const member of members) {
        const communityId = member.communityId;
        
        if (!this.communityOnlineMap.has(communityId)) {
          this.communityOnlineMap.set(communityId, new Set());
        }

        const onlineSet = this.communityOnlineMap.get(communityId)!;
        const previouslyOnline = onlineSet.size;
        
        onlineSet.add(payload.userId);
        
        const currentlyOnline = onlineSet.size;

        if (previouslyOnline !== currentlyOnline) {
          this.checkAndBroadcastLiveState(communityId, currentlyOnline);
        }
      }
    } catch (error) {
      this.logger.error(`Error handling user connected for presence tracker: ${error.message}`);
    }
  }

  private async handleUserDisconnected(payload: { userId: string; socketId: string; isStillOnline: boolean }) {
    if (payload.isStillOnline) return; // User is still online on another device

    try {
      const allMembers = await this.memberRepo.findByUser(payload.userId);
      const members = allMembers.filter(m => m.status === CommunityMemberStatus.ACTIVE);

      for (const member of members) {
        const communityId = member.communityId;
        
        if (this.communityOnlineMap.has(communityId)) {
          const onlineSet = this.communityOnlineMap.get(communityId)!;
          const previouslyOnline = onlineSet.size;
          
          onlineSet.delete(payload.userId);
          
          const currentlyOnline = onlineSet.size;

          if (previouslyOnline !== currentlyOnline) {
            this.checkAndBroadcastLiveState(communityId, currentlyOnline);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error handling user disconnected for presence tracker: ${error.message}`);
    }
  }

  private checkAndBroadcastLiveState(communityId: string, onlineCount: number) {
    const isLive = onlineCount >= 2;
    const previouslyLive = this.communityLiveState.get(communityId) || false;

    // We emit if the live status toggled OR if it's already live but the count changed.
    // To avoid spamming, we could only emit on toggle, but the frontend might want updated counts.
    // For now, emit whenever onlineCount changes to keep UI perfectly in sync.
    this.communityLiveState.set(communityId, isLive);

    this.logger.debug(`Community ${communityId} online count: ${onlineCount} (isLive: ${isLive})`);

    this.chatGateway.server.emit('COMMUNITY_LIVE_STATE_CHANGED', {
      communityId,
      isLive,
      onlineMemberCount: onlineCount
    });
  }

  /**
   * Used by CommunityDiscoveryService to inject live stats into query results
   */
  getCommunityLiveStats(communityId: string): { isLive: boolean; onlineMemberCount: number } {
    const count = this.communityOnlineMap.get(communityId)?.size || 0;
    return {
      isLive: count >= 2,
      onlineMemberCount: count
    };
  }
}
