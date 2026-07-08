import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';
import { RedisService } from '../../redis';

export const CommunityEvents = {
  CREATED: 'COMMUNITY_CREATED',
  UPDATED: 'COMMUNITY_UPDATED',
  DELETED: 'COMMUNITY_DELETED',
  JOINED: 'COMMUNITY_JOINED',
  LEFT: 'COMMUNITY_LEFT',
  SAVED: 'COMMUNITY_SAVED',
  UNSAVED: 'COMMUNITY_UNSAVED',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  MEMBER_INVITED: 'MEMBER_INVITED',
  MEMBER_KICKED: 'MEMBER_KICKED',
  MEMBER_BANNED: 'MEMBER_BANNED',
  MEMBER_MUTED: 'MEMBER_MUTED',
  OWNER_TRANSFERRED: 'OWNER_TRANSFERRED',
  ROLE_CHANGED: 'ROLE_CHANGED',
};

@Injectable()
export class CommunityEventDispatcher extends EventEmitter {
  private readonly logger = new Logger(CommunityEventDispatcher.name);

  constructor(private readonly redisService: RedisService) {
    super();
    this.setMaxListeners(50);
  }

  emit(eventName: string | symbol, ...args: any[]): boolean {
    const result = super.emit(eventName, ...args);
    const payload = args[0];
    if (payload && payload.communityId) {
      const channel = `channel:events:community:${payload.communityId}`;
      this.redisService.client.publish(channel, JSON.stringify({ event: eventName, payload }))
        .catch(err => this.logger.error(`Redis publish failed for ${String(eventName)}`, err));
    }
    return result;
  }

  dispatchCreated(communityId: string, ownerId: string) {
    this.logger.debug(`Dispatching event: ${CommunityEvents.CREATED}`);
    this.emit(CommunityEvents.CREATED, { communityId, ownerId });
  }

  dispatchUpdated(communityId: string, updatedBy: string) {
    this.logger.debug(`Dispatching event: ${CommunityEvents.UPDATED}`);
    this.emit(CommunityEvents.UPDATED, { communityId, updatedBy });
  }

  dispatchDeleted(communityId: string, deletedBy: string) {
    this.logger.debug(`Dispatching event: ${CommunityEvents.DELETED}`);
    this.emit(CommunityEvents.DELETED, { communityId, deletedBy });
  }

  dispatchJoined(communityId: string, userId: string) {
    this.logger.debug(`Dispatching event: ${CommunityEvents.JOINED}`);
    this.emit(CommunityEvents.JOINED, { communityId, userId });
  }

  dispatchLeft(communityId: string, userId: string) {
    this.logger.debug(`Dispatching event: ${CommunityEvents.LEFT}`);
    this.emit(CommunityEvents.LEFT, { communityId, userId });
  }

  dispatchSaved(communityId: string, userId: string) {
    this.logger.debug(`Dispatching event: ${CommunityEvents.SAVED}`);
    this.emit(CommunityEvents.SAVED, { communityId, userId });
  }

  dispatchUnsaved(communityId: string, userId: string) {
    this.logger.debug(`Dispatching event: ${CommunityEvents.UNSAVED}`);
    this.emit(CommunityEvents.UNSAVED, { communityId, userId });
  }

  dispatchSettingsUpdated(communityId: string, updatedBy: string) {
    this.logger.debug(`Dispatching event: ${CommunityEvents.SETTINGS_UPDATED}`);
    this.emit(CommunityEvents.SETTINGS_UPDATED, { communityId, updatedBy });
  }

  dispatchMemberInvited(communityId: string, senderId: string, receiverId: string) {
    this.logger.debug(`Dispatching event: ${CommunityEvents.MEMBER_INVITED}`);
    this.emit(CommunityEvents.MEMBER_INVITED, { communityId, senderId, receiverId });
  }

  dispatchMemberKicked(communityId: string, userId: string, kickedBy: string) {
    this.logger.debug(`Dispatching event: ${CommunityEvents.MEMBER_KICKED}`);
    this.emit(CommunityEvents.MEMBER_KICKED, { communityId, userId, kickedBy });
  }

  dispatchMemberBanned(communityId: string, userId: string, bannedBy: string) {
    this.logger.debug(`Dispatching event: ${CommunityEvents.MEMBER_BANNED}`);
    this.emit(CommunityEvents.MEMBER_BANNED, { communityId, userId, bannedBy });
  }

  dispatchMemberMuted(communityId: string, userId: string, mutedBy: string, mutedUntil: Date) {
    this.logger.debug(`Dispatching event: ${CommunityEvents.MEMBER_MUTED}`);
    this.emit(CommunityEvents.MEMBER_MUTED, { communityId, userId, mutedBy, mutedUntil });
  }

  dispatchOwnerTransferred(communityId: string, oldOwnerId: string, newOwnerId: string) {
    this.logger.debug(`Dispatching event: ${CommunityEvents.OWNER_TRANSFERRED}`);
    this.emit(CommunityEvents.OWNER_TRANSFERRED, { communityId, oldOwnerId, newOwnerId });
  }

  dispatchRoleChanged(communityId: string, userId: string, roleId: string, changedBy: string) {
    this.logger.debug(`Dispatching event: ${CommunityEvents.ROLE_CHANGED}`);
    this.emit(CommunityEvents.ROLE_CHANGED, { communityId, userId, roleId, changedBy });
  }
}
