import { Injectable, Logger } from '@nestjs/common';
import { ConversationRepository } from '../repositories/conversation.repository';
import { ConversationMemberStateEntity } from '../entities/conversation-member-state.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    private readonly conversationRepository: ConversationRepository,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getConversations(userId: string) {
    const conversations =
      await this.conversationRepository.findByUserId(userId);
    return conversations.map((conv) => ({
      ...conv,
      unreadCount: conv.unreadCounts[userId] ?? 0,
    }));
  }

  async getOrCreateDirectConversation(
    requesterId: string,
    targetUserId: string,
  ) {
    const conversation = await this.conversationRepository.findOrCreateDirect(
      requesterId,
      targetUserId,
    );
    return { conversationId: conversation.id };
  }

  async updateMemberReadState(
    conversationId: string,
    userId: string,
    sequenceNumber: number,
  ) {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(ConversationMemberStateEntity)
      .values({ conversationId, userId, lastReadSequence: sequenceNumber })
      .orUpdate(['lastReadSequence', 'updatedAt'], ['conversationId', 'userId'])
      .execute();
  }

  async updateMemberDeliveredState(
    conversationId: string,
    userId: string,
    sequenceNumber: number,
  ) {
    await this.dataSource
      .createQueryBuilder()
      .insert()
      .into(ConversationMemberStateEntity)
      .values({ conversationId, userId, lastDeliveredSequence: sequenceNumber })
      .orUpdate(
        ['lastDeliveredSequence', 'updatedAt'],
        ['conversationId', 'userId'],
      )
      .execute();
  }
}
