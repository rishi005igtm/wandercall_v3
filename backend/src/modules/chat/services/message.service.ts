import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { MessageRepository } from '../repositories/message.repository';
import { ConversationRepository } from '../repositories/conversation.repository';
import { SendMessageDto } from '../dto/send-message.dto';
import {
  MessageEntity,
  MessageType,
  MessageStatus,
} from '../entities/message.entity';
import { randomUUID } from 'crypto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MAX_MESSAGE_LENGTH } from '../constants/chat.constants';
import { SendMessageAckDto } from '../dto/conversation-response.dto';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly conversationRepository: ConversationRepository,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async validateMessageContent(dto: SendMessageDto) {
    if (!dto.text && (!dto.attachments || dto.attachments.length === 0)) {
      if (dto.type === MessageType.TEXT || !dto.type) {
        throw new BadRequestException('Message must have text or attachments.');
      }
    }
    if (dto.text && dto.text.length > MAX_MESSAGE_LENGTH) {
      throw new BadRequestException(
        `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.`,
      );
    }
  }

  async persistMessage(
    senderId: string,
    conversationId: string,
    dto: SendMessageDto,
    recipientIds: string[],
  ): Promise<{ message: MessageEntity; isDuplicate: boolean }> {
    const existing = await this.messageRepository.findByClientMessageId(
      dto.clientMessageId,
    );
    if (existing) {
      this.logger.warn(
        `Idempotency hit: Duplicate clientMessageId ${dto.clientMessageId}`,
      );
      return { message: existing, isDuplicate: true };
    }

    const sentMessage = await this.dataSource.transaction(async (manager) => {
      // 1. Generate next sequence number (using Postgres sequence or max query for simplicity in this iteration)
      const res = await manager.query(
        `SELECT COALESCE(MAX("sequenceNumber"), 0) + 1 AS next_seq FROM chat_messages WHERE "conversationId" = $1`,
        [conversationId],
      );
      const nextSequenceNumber = parseInt(res[0].next_seq, 10);

      const message = manager.create(MessageEntity, {
        id: randomUUID(),
        clientMessageId: dto.clientMessageId,
        conversationId,
        senderId,
        text: dto.text,
        type: dto.type || MessageType.TEXT,
        attachments: dto.attachments,
        replyToId: dto.replyToId,
        status: MessageStatus.SENT,
        sequenceNumber: nextSequenceNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: dto.metadata,
      });

      const savedMessage = await manager.save(MessageEntity, message);

      // 2. Update conversation summary
      await this.conversationRepository.updateLastMessage(
        conversationId,
        savedMessage.id,
        senderId,
        savedMessage.text || 'Attachment',
        savedMessage.createdAt,
        recipientIds,
      );

      return savedMessage;
    });

    return { message: sentMessage, isDuplicate: false };
  }
}
