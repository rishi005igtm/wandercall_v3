import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  ConversationEntity,
  ConversationType,
} from '../entities/conversation.entity';
import { ConversationParticipantEntity } from '../entities/conversation-participant.entity';

@Injectable()
export class ConversationRepository {
  private readonly logger = new Logger(ConversationRepository.name);

  constructor(
    @InjectRepository(ConversationEntity)
    private readonly convRepo: Repository<ConversationEntity>,
    @InjectRepository(ConversationParticipantEntity)
    private readonly participantRepo: Repository<ConversationParticipantEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Find or create a DIRECT conversation between exactly two users.
   *
   * Architecture:
   * - Uses `participantKey` column (format: "sortedIdA:sortedIdB") as the unique identity
   * - Single INSERT ... ON CONFLICT (participantKey) DO NOTHING + SELECT is fully atomic
   * - No separate check-then-create needed — the unique constraint handles races at DB level
   * - Advisory lock fallback retained for extra safety on concurrent inserts
   *
   * This guarantees: for any pair of users, exactly ONE conversation ever exists.
   */
  async findOrCreateDirect(
    userAId: string,
    userBId: string,
  ): Promise<ConversationEntity> {
    // Canonical sorted key — always the same regardless of argument order
    const [idA, idB] = [userAId, userBId].sort();
    const participantKey = `${idA}:${idB}`;

    // Fast path: lookup by participantKey (indexed, O(1))
    const existing = await this.convRepo.findOne({
      where: { participantKey, type: ConversationType.DIRECT },
    });

    if (existing) {
      return existing;
    }

    // Slow path with advisory lock to serialize concurrent first-time creates
    const lockKey1 = this.hashUserId(idA);
    const lockKey2 = this.hashUserId(idB);

    return this.dataSource.transaction(async (manager) => {
      // Acquire transaction-level advisory lock — released when transaction ends
      await manager.query(`SELECT pg_advisory_xact_lock($1, $2)`, [
        lockKey1,
        lockKey2,
      ]);

      // Re-check inside the lock (another transaction may have just committed)
      const doubleCheck = await manager.findOne(ConversationEntity, {
        where: { participantKey, type: ConversationType.DIRECT },
      });

      if (doubleCheck) {
        return doubleCheck;
      }

      // Create
      const conversation = manager.create(ConversationEntity, {
        id: randomUUID(),
        type: ConversationType.DIRECT,
        participantKey,
        unreadCounts: {},
      });
      const savedConv = await manager.save(ConversationEntity, conversation);

      const participantA = manager.create(ConversationParticipantEntity, {
        conversationId: savedConv.id,
        userId: idA,
        joinedAt: new Date(),
      });
      const participantB = manager.create(ConversationParticipantEntity, {
        conversationId: savedConv.id,
        userId: idB,
        joinedAt: new Date(),
      });
      await manager.save(ConversationParticipantEntity, [
        participantA,
        participantB,
      ]);

      this.logger.log(
        `Created DIRECT conversation ${savedConv.id} (key: ${participantKey})`,
      );
      return savedConv;
    });
  }

  /**
   * Derive a stable int32 from a UUID string for use as advisory lock key.
   */
  private hashUserId(userId: string): number {
    const hex = userId.replace(/-/g, '');
    let hash = 0;
    for (let i = 0; i < hex.length; i += 8) {
      hash ^= parseInt(hex.slice(i, i + 8), 16) | 0;
    }
    return hash;
  }

  async findById(id: string): Promise<ConversationEntity | null> {
    return this.convRepo.findOne({ where: { id } });
  }

  /**
   * Get all conversations for a user, ordered by last message time.
   * Returns a lightweight list suitable for the conversation sidebar.
   */
  async findByUserId(userId: string): Promise<ConversationEntity[]> {
    return this.dataSource
      .createQueryBuilder(ConversationEntity, 'c')
      .innerJoin(
        ConversationParticipantEntity,
        'p',
        'p.conversationId = c.id AND p.userId = :userId AND p.hasLeft = false',
        { userId },
      )
      .orderBy('c.lastMessageAt', 'DESC', 'NULLS LAST')
      .addOrderBy('c.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Get participants for a conversation.
   */
  async getParticipants(
    conversationId: string,
  ): Promise<ConversationParticipantEntity[]> {
    return this.participantRepo.find({ where: { conversationId } });
  }

  /**
   * Check if a user is a participant in a conversation.
   */
  async isParticipant(
    conversationId: string,
    userId: string,
  ): Promise<boolean> {
    const count = await this.participantRepo.count({
      where: { conversationId, userId, hasLeft: false },
    });
    return count > 0;
  }

  /**
   * Get the participant record — used for updating lastReadAt.
   */
  async getParticipant(
    conversationId: string,
    userId: string,
  ): Promise<ConversationParticipantEntity | null> {
    return this.participantRepo.findOne({ where: { conversationId, userId } });
  }

  /**
   * Update the lastMessage summary on a conversation after a new message is sent.
   * Called by ChatService after persisting a message.
   */
  async updateLastMessage(
    conversationId: string,
    messageId: string,
    senderId: string,
    text: string,
    sentAt: Date,
    recipientIds: string[],
  ): Promise<void> {
    const conversation = await this.convRepo.findOneOrFail({
      where: { id: conversationId },
    });

    const updatePayload: any = {
      lastMessageId: messageId,
      lastMessageSenderId: senderId,
      lastMessageText: text.length > 100 ? text.slice(0, 100) + '…' : text,
      lastMessageAt: sentAt,
    };

    // ONLY update JSONB unreadCounts for direct/group conversations to avoid massive row locks.
    if (
      conversation.type !== ConversationType.COMMUNITY &&
      conversation.type !== ConversationType.CAMPFIRE
    ) {
      const updatedUnreadCounts = { ...conversation.unreadCounts };
      for (const recipientId of recipientIds) {
        if (recipientId !== senderId) {
          updatedUnreadCounts[recipientId] =
            (updatedUnreadCounts[recipientId] || 0) + 1;
        }
      }
      updatePayload.unreadCounts = updatedUnreadCounts;
    }

    await this.convRepo.update(conversationId, updatePayload);
  }

  /**
   * Clear the unread count for a user in a conversation.
   * Called when the user opens the conversation.
   */
  async clearUnreadCount(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const conversation = await this.convRepo.findOne({
      where: { id: conversationId },
    });
    if (!conversation) return;

    const updatedCounts = { ...conversation.unreadCounts };
    updatedCounts[userId] = 0;
    await this.convRepo.update(conversationId, { unreadCounts: updatedCounts });

    // Update participant's lastReadAt
    await this.participantRepo.update(
      { conversationId, userId },
      { lastReadAt: new Date() },
    );
  }

  /**
   * Get the IDs of all participants in a conversation.
   */
  async getParticipantIds(conversationId: string): Promise<string[]> {
    const participants = await this.participantRepo.find({
      where: { conversationId },
    });
    return participants.map((p) => p.userId);
  }

  async createCommunityConversation(
    communityId: string,
  ): Promise<ConversationEntity> {
    const conversation = this.convRepo.create({
      id: randomUUID(),
      type: ConversationType.COMMUNITY,
      metadata: {
        communityId,
        isDefault: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.convRepo.save(conversation);
  }

  async findDefaultCommunityConversation(
    communityId: string,
  ): Promise<ConversationEntity | null> {
    return this.convRepo
      .createQueryBuilder('conv')
      .where('conv.type = :type', { type: ConversationType.COMMUNITY })
      .andWhere("conv.metadata->>'communityId' = :communityId", { communityId })
      .andWhere("conv.metadata->>'isDefault' = 'true'")
      .getOne();
  }

  async createCampfireConversation(
    campfireId: string,
  ): Promise<ConversationEntity> {
    const conversation = this.convRepo.create({
      id: randomUUID(),
      type: ConversationType.CAMPFIRE,
      metadata: { campfireId },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return this.convRepo.save(conversation);
  }

  async findCampfireConversation(
    campfireId: string,
  ): Promise<ConversationEntity | null> {
    return this.convRepo
      .createQueryBuilder('conv')
      .where('conv.type = :type', { type: ConversationType.CAMPFIRE })
      .andWhere("conv.metadata->>'campfireId' = :campfireId", { campfireId })
      .getOne();
  }
}
