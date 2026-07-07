import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { CommunityInviteRepository } from '../repositories/community-invite.repository';
import { CommunityRepository } from '../repositories/community.repository';
import { FollowRepository } from '../../user/repositories/follow.repository';
import { ChatService } from '../../chat/services/chat.service';
import { CommunityEventDispatcher } from '../events/community-event.dispatcher';
import { MessageType } from '../../chat/entities/message.entity';
import { CommunityInviteStatus } from '../entities/community-invite.entity';
import { CommunityMembershipService } from './community-membership.service';

@Injectable()
export class CommunityInviteService {
  constructor(
    private readonly inviteRepo: CommunityInviteRepository,
    private readonly communityRepo: CommunityRepository,
    private readonly followRepo: FollowRepository,
    private readonly chatService: ChatService,
    private readonly eventDispatcher: CommunityEventDispatcher,
    private readonly membershipService: CommunityMembershipService,
    private readonly dataSource: DataSource,
  ) {}

  async createInitialInvites(
    community: any,
    senderId: string,
    invitedUserIds: string[],
  ): Promise<void> {
    if (!invitedUserIds || invitedUserIds.length === 0) return;
    const uniqueIds = [...new Set(invitedUserIds)].filter((id) => id !== senderId);

    for (const targetUserId of uniqueIds) {
      try {
        await this.sendInvite(community.id, senderId, targetUserId);
      } catch (error) {
        console.warn(`Failed to send initial invite to ${targetUserId}: ${error.message}`);
      }
    }
  }

  async sendInvite(communityId: string, senderId: string, targetUserId: string): Promise<void> {
    if (senderId === targetUserId) {
      throw new BadRequestException('Cannot invite yourself');
    }

    const community = await this.communityRepo.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check if already invited
    const existingInvite = await this.inviteRepo.findPendingInvite(communityId, targetUserId);
    if (existingInvite) {
      throw new ConflictException('An invite is already pending for this user');
    }

    // Create the invite in DB
    const invite = await this.inviteRepo.create({
      communityId: community.id,
      senderId,
      receiverId: targetUserId,
      status: CommunityInviteStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Send chat message
    const { conversationId } = await this.chatService.getOrCreateDirectConversation(senderId, targetUserId);
    
    const msg = await this.chatService.sendMessage(senderId, {
      conversationId,
      type: MessageType.COMMUNITY_INVITE,
      text: `Join ${community.name} - ${community.description?.slice(0, 60) || 'An adventurous community'}...`,
      clientMessageId: randomUUID(),
      metadata: {
        inviteId: invite.id,
        communityId: community.id,
        communityName: community.name,
        communityAvatar: community.avatar,
        communityCover: community.cover,
        memberCount: community.currentMemberCount,
        slug: community.slug,
        description: community.description,
      },
    });

    invite.conversationId = conversationId;
    invite.messageId = msg.id;
    await this.inviteRepo.save(invite);

    this.eventDispatcher.dispatchMemberInvited(communityId, senderId, targetUserId);
  }

  async acceptInvite(inviteId: string, userId: string): Promise<void> {
    const invite = await this.inviteRepo.findById(inviteId);
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.receiverId !== userId) {
      throw new ForbiddenException('You cannot accept an invite sent to someone else');
    }

    if (invite.status === CommunityInviteStatus.ACCEPTED) {
      return; // Idempotent return if already accepted
    }

    if (invite.status !== CommunityInviteStatus.PENDING) {
      throw new BadRequestException(`Invite is already ${invite.status.toLowerCase()}`);
    }

    if (invite.expiresAt && new Date() > invite.expiresAt) {
      await this.inviteRepo.updateStatus(inviteId, CommunityInviteStatus.EXPIRED);
      throw new BadRequestException('This invite has expired');
    }

    // Join community using membership service (which also dispatches JOINED event)
    await this.membershipService.joinCommunity(invite.communityId, userId);

    // Remove invite from community_invites table upon acceptance as required
    await this.inviteRepo.delete(invite.id);
  }

  async declineInvite(inviteId: string, userId: string): Promise<void> {
    const invite = await this.inviteRepo.findById(inviteId);
    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.receiverId !== userId) {
      throw new ForbiddenException('You cannot decline an invite sent to someone else');
    }

    if (invite.status !== CommunityInviteStatus.PENDING) {
      throw new BadRequestException(`Invite is already ${invite.status.toLowerCase()}`);
    }

    // Remove invite from community_invites table upon declining as required
    await this.inviteRepo.delete(invite.id);
  }
}

