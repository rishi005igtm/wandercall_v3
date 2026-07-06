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

@Injectable()
export class CommunityInviteService {
  constructor(
    private readonly inviteRepo: CommunityInviteRepository,
    private readonly communityRepo: CommunityRepository,
    private readonly followRepo: FollowRepository,
    private readonly chatService: ChatService,
    private readonly eventDispatcher: CommunityEventDispatcher,
    private readonly dataSource: DataSource,
  ) {}

  async sendInvite(communityId: string, senderId: string, targetUserId: string): Promise<void> {
    if (senderId === targetUserId) {
      throw new BadRequestException('Cannot invite yourself');
    }

    const community = await this.communityRepo.findById(communityId);
    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Must be mutual friends (Follows each other)
    const [senderFollowsTarget, targetFollowsSender] = await Promise.all([
      this.followRepo.findOne(senderId, targetUserId),
      this.followRepo.findOne(targetUserId, senderId),
    ]);

    if (!senderFollowsTarget || !targetFollowsSender) {
      throw new ForbiddenException('You can only invite mutual friends');
    }

    // Check if already invited
    const existingInvite = await this.inviteRepo.findPendingInvite(communityId, targetUserId);
    if (existingInvite) {
      throw new ConflictException('An invite is already pending for this user');
    }

    // Create the invite in DB
    const invite = await this.inviteRepo.create({
      communityId,
      senderId,
      receiverId: targetUserId,
      status: CommunityInviteStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Send chat message
    const { conversationId } = await this.chatService.getOrCreateDirectConversation(senderId, targetUserId);
    
    await this.chatService.sendMessage(senderId, {
      conversationId,
      type: MessageType.COMMUNITY_INVITE,
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

    this.eventDispatcher.dispatchMemberInvited(communityId, senderId, targetUserId);
  }
}
