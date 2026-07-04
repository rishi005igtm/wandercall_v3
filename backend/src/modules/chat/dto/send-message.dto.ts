import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '../entities/message.entity';
import { MAX_MESSAGE_LENGTH } from '../constants/chat.constants';

export class AttachmentDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  publicId?: string;

  @IsString()
  mimeType: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  size?: number;
}

export class SendMessageDto {
  /**
   * Client-generated UUID for idempotency.
   * The server returns the serverMessageId in the ACK.
   * If the client retries and the same clientMessageId exists, the server
   * returns the existing message — no duplicate is created.
   */
  @IsUUID()
  clientMessageId: string;

  @IsUUID()
  conversationId: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType = MessageType.TEXT;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_MESSAGE_LENGTH)
  text?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @IsOptional()
  @IsUUID()
  replyToId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class MarkReadDto {
  @IsUUID()
  conversationId: string;

  @IsUUID()
  messageId: string;
}

export class MarkDeliveredDto {
  @IsUUID()
  messageId: string;
}

export class TypingDto {
  @IsUUID()
  conversationId: string;
}

export class OpenConversationDto {
  @IsUUID()
  conversationId: string;
}
