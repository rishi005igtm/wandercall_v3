import { ConversationType } from '../entities/conversation.entity';

export class ParticipantDto {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeen?: Date;
}

export class ConversationResponseDto {
  id: string;
  type: ConversationType;
  participants: ParticipantDto[];
  lastMessageText?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class MessageResponseDto {
  id: string;
  clientMessageId: string;
  conversationId: string;
  senderId: string;
  senderUsername?: string;
  senderDisplayName?: string;
  senderAvatarUrl?: string;
  type: string;
  text?: string;
  attachments?: any[];
  replyToId?: string;
  status: string;
  isEdited: boolean;
  isDeleted: boolean;
  reactions?: Record<string, string[]>;
  deliveredAt?: Date;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class SendMessageAckDto {
  success: boolean;
  clientMessageId: string;
  serverMessageId: string;
  status: string;
  createdAt: Date;
}

export class ErrorAckDto {
  success: false;
  code: string;
  message: string;
}
