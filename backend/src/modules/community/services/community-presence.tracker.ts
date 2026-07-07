import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChatEventDispatcher } from '../../chat/services/chat-event.dispatcher';
import { ChatGateway } from '../../chat/chat.gateway';
import { CommunityMemberRepository } from '../repositories/community-member.repository';
import { CommunityMemberStatus } from '../entities/community-member.entity';
import { CommunityEventDispatcher, CommunityEvents } from '../events/community-event.dispatcher';

@Injectable()
export class CommunityPresenceTracker implements OnModuleInit {
  private readonly logger = new Logger(CommunityPresenceTracker.name);

  // communityId -> Set of online user IDs
  private readonly communityOnlineMap = new Map<string, Set<string>>();

  // communityId -> boolean (isLive)
  private readonly communityLiveState = new Map<string, boolean>();

  // communityId -> Map<userId, user info>
  private readonly lobbyCohorts = new Map<string, Map<string, any>>();
  // communityId -> Map<userId, Set<socketId>>
  private readonly communityUserSockets = new Map<string, Map<string, Set<string>>>();

  // socketId -> communityId
  private readonly socketLobbyMap = new Map<string, string>();

  // Timeout for debouncing disconnects
  private readonly disconnectTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly chatDispatcher: ChatEventDispatcher,
    private readonly chatGateway: ChatGateway,
    private readonly memberRepo: CommunityMemberRepository,
    private readonly communityDispatcher: CommunityEventDispatcher,
  ) {}

  onModuleInit() {
    this.chatDispatcher.subscribe('USER_CONNECTED', this.handleUserConnected.bind(this));
    this.chatDispatcher.subscribe('USER_DISCONNECTED', this.handleUserDisconnected.bind(this));
    this.chatDispatcher.subscribe('COMMUNITY_JOIN_LOBBY' as any, this.handleJoinLobby.bind(this));
    this.chatDispatcher.subscribe('COMMUNITY_LEAVE_LOBBY' as any, this.handleLeaveLobby.bind(this));

    this.communityDispatcher.on(CommunityEvents.JOINED, (payload) => {
      this.broadcastCommunityUpdate(payload.communityId);
      this.broadcastActiveCohort(payload.communityId);
    });
    this.communityDispatcher.on(CommunityEvents.LEFT, (payload) => {
      this.broadcastCommunityUpdate(payload.communityId);
      this.removeUserSocketFromLobby(payload.communityId, payload.userId);
    });
    this.communityDispatcher.on(CommunityEvents.MEMBER_KICKED, (payload) => {
      this.broadcastCommunityUpdate(payload.communityId);
      this.removeUserSocketFromLobby(payload.communityId, payload.userId);
    });
    this.communityDispatcher.on(CommunityEvents.MEMBER_BANNED, (payload) => {
      this.broadcastCommunityUpdate(payload.communityId);
      this.removeUserSocketFromLobby(payload.communityId, payload.userId);
    });
    this.communityDispatcher.on(CommunityEvents.ROLE_CHANGED, (payload) => this.broadcastCommunityUpdate(payload.communityId));
    this.communityDispatcher.on(CommunityEvents.UPDATED, (payload) => this.broadcastCommunityUpdate(payload.communityId));
    this.communityDispatcher.on(CommunityEvents.MEMBER_INVITED, (payload) => this.broadcastCommunityUpdate(payload.communityId));

    this.logger.log('Initialized and subscribed to Chat & Community presence events');
  }

  private broadcastCommunityUpdate(communityId: string) {
    if (!communityId) return;
    this.logger.debug(`Broadcasting real-time COMMUNITY_UPDATED for community ${communityId}`);
    this.chatGateway.server?.emit('COMMUNITY_UPDATED', { communityId });
  }

  private handleJoinLobby(payload: { communityId: string; userId: string; user: any; socketId: string }) {
    const { communityId, userId, user, socketId } = payload;
    if (!communityId || !userId || !socketId) return;

    const timerId = `${userId}:${communityId}`;
    if (this.disconnectTimers.has(timerId)) {
      clearTimeout(this.disconnectTimers.get(timerId));
      this.disconnectTimers.delete(timerId);
    }

    if (!this.communityUserSockets.has(communityId)) {
      this.communityUserSockets.set(communityId, new Map());
    }
    const userSockets = this.communityUserSockets.get(communityId)!;
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socketId);
    this.socketLobbyMap.set(socketId, communityId);

    if (!this.lobbyCohorts.has(communityId)) {
      this.lobbyCohorts.set(communityId, new Map());
    }
    this.lobbyCohorts.get(communityId)!.set(userId, {
      userId,
      displayName: user?.displayName || user?.username || 'Traveler',
      username: user?.username || 'traveler',
      avatarUrl: user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
      roleName: user?.roleName || (user?.isOwner ? 'OWNER' : (user?.isMember ? 'MEMBER' : 'GUEST')),
      status: user?.status || 'Active Now',
      level: user?.level || 1,
    });
    this.broadcastActiveCohort(communityId);
  }

  private handleLeaveLobby(payload: { communityId: string; userId: string; socketId?: string }) {
    const { communityId, userId, socketId } = payload;
    if (!communityId || !userId) return;
    this.removeUserSocketFromLobby(communityId, userId, socketId);
  }

  private removeUserSocketFromLobby(communityId: string, userId: string, socketId?: string) {
    const userSockets = this.communityUserSockets.get(communityId);
    if (!userSockets || !userSockets.has(userId)) return;

    if (socketId) {
      userSockets.get(userId)!.delete(socketId);
      this.socketLobbyMap.delete(socketId);
    } else {
      userSockets.get(userId)!.clear();
    }

    if (userSockets.get(userId)!.size === 0) {
      const timerId = `${userId}:${communityId}`;
      if (this.disconnectTimers.has(timerId)) {
        clearTimeout(this.disconnectTimers.get(timerId));
      }

      const timer = setTimeout(() => {
        const currentSockets = this.communityUserSockets.get(communityId)?.get(userId);
        if (!currentSockets || currentSockets.size === 0) {
          this.communityUserSockets.get(communityId)?.delete(userId);
          if (this.lobbyCohorts.has(communityId)) {
            this.lobbyCohorts.get(communityId)!.delete(userId);
            this.broadcastActiveCohort(communityId);
          }
        }
        this.disconnectTimers.delete(timerId);
      }, 3000);

      this.disconnectTimers.set(timerId, timer);
    }
  }

  private broadcastActiveCohort(communityId: string) {
    const cohortMap = this.lobbyCohorts.get(communityId);
    const activeCohort = cohortMap ? Array.from(cohortMap.values()) : [];
    this.logger.debug(`Broadcasting active cohort for community ${communityId}: ${activeCohort.length} users`);
    this.chatGateway.server?.to(`community:${communityId}`).emit('community:active-cohort-updated', {
      communityId,
      activeCohort,
    });
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
    const { userId, socketId, isStillOnline } = payload;

    // Clean up lobby presence for this socket immediately
    const communityId = this.socketLobbyMap.get(socketId);
    if (communityId) {
      this.removeUserSocketFromLobby(communityId, userId, socketId);
    }

    if (isStillOnline) return;

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
    } catch (error: any) {
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
