import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  MessageEntity,
  MessageType,
  MessageStatus,
} from '../entities/message.entity';
import {
  ConversationEntity,
  ConversationType,
} from '../entities/conversation.entity';
import { MessageRepository } from '../repositories/message.repository';
import { ConversationRepository } from '../repositories/conversation.repository';
import { ChatEventDispatcher } from './chat-event.dispatcher';
import { SendMessageDto } from '../dto/send-message.dto';
import { SendMessageAckDto } from '../dto/conversation-response.dto';
import { CommunityMemberRepository } from '../../community/repositories/community-member.repository';
import { CommunityMemberStatus } from '../../community/entities/community-member.entity';
import { MAX_MESSAGE_LENGTH } from '../constants/chat.constants';
import { MessageService } from './message.service';

@Injectable()
export class CommunityChatService {
  private readonly logger = new Logger(CommunityChatService.name);
  private readonly rateLimitMap = new Map<
    string,
    { count: number; windowStart: number }
  >();

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationRepository: ConversationRepository,
    private readonly communityMemberRepo: CommunityMemberRepository,
    private readonly chatEventDispatcher: ChatEventDispatcher,
    private readonly messageService: MessageService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  private enforceRateLimit(userId: string): void {
    const now = Date.now();
    const windowMs = 5000;
    const maxMessages = 10;

    let record = this.rateLimitMap.get(userId);
    if (!record || now - record.windowStart > windowMs) {
      record = { count: 0, windowStart: now };
    }

    record.count++;
    this.rateLimitMap.set(userId, record);

    if (record.count > maxMessages) {
      throw new BadRequestException(
        'Rate limit exceeded. Please wait before sending more messages.',
      );
    }
  }

  async sendMessage(
    senderId: string,
    communityId: string,
    dto: SendMessageDto,
  ): Promise<SendMessageAckDto> {
    this.enforceRateLimit(senderId);

    const member = await this.communityMemberRepo.findByUserAndCommunity(
      senderId,
      communityId,
    );
    if (!member || member.status !== CommunityMemberStatus.ACTIVE) {
      throw new ForbiddenException(
        'You must be an active member of this community to send messages.',
      );
    }
    if (member.isMuted) {
      throw new ForbiddenException(
        'You are currently muted in this community.',
      );
    }

    await this.messageService.validateMessageContent(dto);

    const conversationId = dto.conversationId;

    // In the future, check CommunityRoom settings here (e.g., slowMode, announcementOnly)

    const { message: sentMessage, isDuplicate } =
      await this.messageService.persistMessage(
        senderId,
        conversationId,
        dto,
        [], // Community messages don't lock per-user unread counts in the DB
      );

    if (!isDuplicate) {
      // Enforce 500 messages cap efficiently in the background
      this.dataSource
        .query(
          `
        DELETE FROM chat_messages 
        WHERE id IN (
          SELECT id FROM chat_messages 
          WHERE "conversationId" = $1 
          ORDER BY "createdAt" DESC 
          OFFSET 500
        )
      `,
          [conversationId],
        )
        .catch((err) => {
          this.logger.error(
            `Failed to enforce message cap for community conversation ${conversationId}`,
            err,
          );
        });

      this.chatEventDispatcher.dispatchCommunityMessage(
        communityId,
        sentMessage,
      );
    }

    return {
      success: true,
      clientMessageId: dto.clientMessageId,
      serverMessageId: sentMessage.id,
      status: sentMessage.status,
      createdAt: sentMessage.createdAt,
    };
  }

  async getMessages(
    userId: string,
    communityId: string,
    conversationId: string,
    cursor?: Date,
    limit = 50,
  ) {
    const member = await this.communityMemberRepo.findByUserAndCommunity(
      userId,
      communityId,
    );
    if (!member || member.status !== CommunityMemberStatus.ACTIVE) {
      throw new ForbiddenException('Not an active member of this community.');
    }

    return this.messageRepository.paginate(
      conversationId,
      limit,
      cursor?.toISOString(),
    );
  }

  async createBaseConversation(communityId: string, ownerId: string) {
    return this.conversationRepository.createCommunityConversation(communityId);
  }

  async getDefaultConversation(
    communityId: string,
  ): Promise<ConversationEntity> {
    let conv =
      await this.conversationRepository.findDefaultCommunityConversation(
        communityId,
      );
    if (!conv) {
      this.logger.warn(
        `Default conversation not found for community ${communityId}. Auto-provisioning...`,
      );
      conv =
        await this.conversationRepository.createCommunityConversation(
          communityId,
        );
    }
    return conv;
  }
}
